import React ,{ useState, useEffect} from "react";
import  Chart  from "react-apexcharts";
function Piechart({data})
{
   const [minor, setMinor]= useState(0);
   const [major, setMajor]= useState(0);
   const [critical, setCritical]= useState(0);
   const [warning, setWarning]= useState(0);
   useEffect(() => {
    async function getData(data) {
      let minorCount = 0;
      let majorCount = 0;
      let criticalCount = 0;
      let warningCount = 0;
  
      for (let i = 0; i < data.length; i++) {
        if (data[i].state['alarm-severity'] === 'MINOR') {
          minorCount = minorCount + 1;
        }
        if (data[i].state['alarm-severity'] === 'MAJOR') {
          majorCount = majorCount + 1;
        }
        if (data[i].state['alarm-severity'] === 'CRITICAL') {
          criticalCount = criticalCount + 1;
        }
        if (data[i].state['alarm-severity'] === 'WARNING') {
          warningCount = warningCount + 1;
        }
      }
  
      setMinor(prevState => prevState + minorCount);
      setMajor(prevState => prevState + majorCount);
      setCritical(prevState => prevState + criticalCount);
      setWarning(prevState => prevState + warningCount);
    }
  
    getData(data);
  }, [data, setMinor, setMajor, setCritical, setWarning]);
  
    return(
        warning || minor || major || critical ?(
            <div className="container-fluid mb-3" style={{marginTop:'30px',marginLeft:'-20px'}}>
                <Chart
                type="pie"
                width={360}               
                height={700}
                // series={[3,2,4,5]}                          
                series={[warning,minor,major,critical]}                          
                options={{
                        title:{ text:""
                        } , 
                       noData:{text:""},                        
                      colors:["#ADD8E6","#FFFF00","#FFA500","#FF0000"],        
                      labels:['Warning','Minor','Major','Critical']                     
                 }}
                >
                </Chart>
            </div>
        ):null
    );
}
export default Piechart;