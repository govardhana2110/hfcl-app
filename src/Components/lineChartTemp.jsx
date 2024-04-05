import React,{useEffect, useState} from 'react';
import Chart from 'react-apexcharts';
//install : npm install react-apexcharts apexcharts//
function Linechart({data})
{
    localStorage.setItem('00',parseInt(0))
    localStorage.setItem('01',parseInt(0))
    localStorage.setItem('02',parseInt(0))
    localStorage.setItem('03',parseInt(0))
    localStorage.setItem('04',parseInt(0))
    localStorage.setItem('05',parseInt(0))
    localStorage.setItem('06',parseInt(0))
    localStorage.setItem('07',parseInt(0))
    localStorage.setItem('08',parseInt(0))
    localStorage.setItem('09',parseInt(0))
    localStorage.setItem('10',parseInt(0))
    localStorage.setItem('11',parseInt(0))
    localStorage.setItem('12',parseInt(0))
    

    useEffect( ()=>{
        async function getData() {
            var alarmlist_array = JSON.parse(data)
            console.log(alarmlist_array,'alarm from line')
            for(let i=0;i<alarmlist_array.active_alarm_list.value.length;i++){
                
                localStorage.setItem(alarmlist_array.active_alarm_list.value[i].event_time.substring(5,7),parseInt(localStorage.getItem(alarmlist_array.active_alarm_list.value[i].event_time.substring(5,7)))+1)
            }
            console.log(parseInt(localStorage.getItem('10')))
            }
            getData();
            return;
       });
       const[product, ]= useState(
        [
            {
                name: 'Average' ,
                data:[2,6,4,8,9,1,2,3,5,5,1,2]
                // data:[parseInt(localStorage.getItem('01')),parseInt(localStorage.getItem('02')),parseInt(localStorage.getItem('03')),parseInt(localStorage.getItem('04')),parseInt(localStorage.getItem('05')),parseInt(localStorage.getItem('06')),parseInt(localStorage.getItem('07')),parseInt(localStorage.getItem('08')),parseInt(localStorage.getItem('09')),parseInt(localStorage.getItem('10')),parseInt(localStorage.getItem('11')),parseInt(localStorage.getItem('12'))]
            },
            {
                name: 'Instant' ,
                data:[5,8,3,2,6,1,10,9,4,7,6,4]
                // data:[parseInt(localStorage.getItem('01')),parseInt(localStorage.getItem('02')),parseInt(localStorage.getItem('03')),parseInt(localStorage.getItem('04')),parseInt(localStorage.getItem('05')),parseInt(localStorage.getItem('06')),parseInt(localStorage.getItem('07')),parseInt(localStorage.getItem('08')),parseInt(localStorage.getItem('09')),parseInt(localStorage.getItem('10')),parseInt(localStorage.getItem('11')),parseInt(localStorage.getItem('12'))]
            },
        ]
    );
    // const[option, ]= useState(
    //     {
    //         title:{ text:""},
    //         xaxis:{
    //             title:{text:""},
    //             categories:['2','4','6','8','10','12','14','16','18','20','22','24']
    //         },
    //         yaxis:{
    //             title:{text:""}                 
    //         }
    //     }
    // );
    return(
        <div className='container-fluid mt-3 mb-3' style={{marginLeft:'-20px'}}>
            <Chart type='line'
          width={500}
          height={180}
          series={product}
          options={{
                chart: {
                    toolbar: {
                        show: false
                    }
                }
            }}
          >
          </Chart>
        </div>
    );
}
export default Linechart;