import React ,{ useEffect,useState} from "react";
import  Chart  from "react-apexcharts";
function Piechart({data})

{
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
   useEffect( ()=>{
    updateDimensions();
   },[]);
   

   function updateDimensions() {
    let width, height;

    if (window.innerWidth === 1024) {
      width = 160;
      height = 175;
    } else if (window.innerWidth === 1440) {
      width = 200;
      height = 200;
    } else if (window.innerWidth === 1366) {
      width = 220;
      height = 180;
    }
     else if(window.innerWidth === 1920){
      width = 300;
      height = 270;

     }

    setDimensions({ width, height });
  }


    return(
            <div className="container-fluid mb-3" style={{marginTop:'-8px',marginLeft:'-10px'}}>
                <Chart
                    className = "pie"
                    type="pie"
                    width={dimensions.width}               
                    height={dimensions.height}
                    series={[data[0].length, data[1].length]}                          
                    options={{
                        noData: {
                            text: ""
                        },    
                        title:{ text:"",style:{
                            marginTop:'10px'
                        }
                        } ,                     
                        colors: ["#ff0000", "#00ff66"],        
                        labels: ['Failed', 'Success'],
                        legend: {
                            show: false
                        }                     
                    }}
                >
                </Chart>
            </div>
    );
}
export default Piechart;