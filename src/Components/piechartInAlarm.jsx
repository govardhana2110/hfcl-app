import { BollingerBandWidthIndicatorDescriptionModule } from "igniteui-react-core";
import React ,{ useState, useEffect} from "react";
import  Chart  from "react-apexcharts";

function Piechart({data}) {
    const [minor, setMinor]= useState(0);
    const [major, setMajor]= useState(0);
    const [critical, setCritical]= useState(0);
    const [warning, setWarning]= useState(0);
    const [widthd, setWidthd] = useState(0);
    const [heightd, setHeightd] = useState(0);

    useEffect(() => {
        getData(data);
        updateDimesnions();
    }, [data]);

    function getData(data) {  
        let minorCount = 0;
        let majorCount = 0;
        let criticalCount = 0;
        let warningCount = 0;

        for(let i=0; i<data.length; i++){
            if(data[i]['alarm-severity'] === 'MINOR'){ 
                minorCount = minorCount + 1;
            } 
            if(data[i]['alarm-severity'] === 'MAJOR'){  
                majorCount = majorCount + 1;
            }            
            if(data[i]['alarm-severity'] === 'CRITICAL'){  
                criticalCount = criticalCount + 1;
            }         
            if(data[i]['alarm-severity'] === 'WARNING'){
                warningCount = warningCount + 1;
            }
        }

        setMinor(prevState => prevState + minorCount);
        setMajor(prevState => prevState + majorCount);
        setCritical(prevState => prevState + criticalCount);
        setWarning(prevState => prevState + warningCount);
    }

    function updateDimesnions() {
        let width,height;

        if (window.innerWidth === 1024) {
            width = 285;
            height = 400;
        } else if (window.innerWidth === 1440) {
            width = 310;
            height = 340;
        } else if (window.innerWidth === 1366) {
            width = 290;
            height = 175;
        } else if (window.innerWidth === 768) {
            width = 350;
            height = 190;
        }
        else if (window.innerWidth === 1920){
            width = 380;
            height = 300;
        }

        setWidthd(width);
        setHeightd(height);
    }

    return (
        <div className="container-fluid mb-3" style={{marginTop:'-8px',marginLeft:'-10px'}}>
            <Chart
                className="alarm_pie"
                type="pie"
                width={widthd}
                height={heightd}
                // window.innerWidth < 1024 ? 400 : window.innerWidth === 1440 ? 340 : 175
                series={[warning, minor, major, critical]}
                options={{
                    title: { text: "" },
                    noData: { text: "" },
                    colors: ["#ADD8E6", "#FFFF00", "#FFA500", "#FF0000"],
                    labels: ['Warning', 'Minor', 'Major', 'Critical']
                }}
            />
        </div>
    );
}

export default Piechart;
