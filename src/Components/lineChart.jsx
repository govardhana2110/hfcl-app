import React,{useEffect, useState} from 'react';
import Chart from 'react-apexcharts';
//install : npm install react-apexcharts apexcharts//

function Linechart({data})
{
    const[heightd,setHeight] = useState(0);
    localStorage.setItem('Jan',parseInt(0))
    localStorage.setItem('Feb',parseInt(0))
    localStorage.setItem('Mar',parseInt(0))
    localStorage.setItem('Apr',parseInt(0))
    localStorage.setItem('May',parseInt(0))
    localStorage.setItem('Jun',parseInt(0))
    localStorage.setItem('Jul',parseInt(0))
    localStorage.setItem('Aug',parseInt(0))
    localStorage.setItem('Sep',parseInt(0))
    localStorage.setItem('Oct',parseInt(0))
    localStorage.setItem('Nov',parseInt(0))
    localStorage.setItem('Dec',parseInt(0))

    const [product, setProduct] = useState(
        [
            {
                name: sessionStorage.getItem('unique_id') ,
                data:[parseInt(localStorage.getItem('Jan')),parseInt(localStorage.getItem('Feb')),parseInt(localStorage.getItem('Mar')),parseInt(localStorage.getItem('Apr')),parseInt(localStorage.getItem('May')),parseInt(localStorage.getItem('Jun')),parseInt(localStorage.getItem('Jul')),parseInt(localStorage.getItem('Aug')),parseInt(localStorage.getItem('Sep')),parseInt(localStorage.getItem('Oct')),parseInt(localStorage.getItem('Nov')),parseInt(localStorage.getItem('Dec'))]
            },
        ]
    );
    const [option] = useState(
        {
            title:{ text:""},
            xaxis:{
                title:{text:""},
                categories:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            },
            yaxis:{
                title:{text:"No. of Alarms"}                
            },
            chart: {
                toolbar: {
                    show: true
                }
            }
        }
    );
    useEffect(() => {
      updateDimension();
        async function getData() {
          var alarmlist_array = data;
          console.log(alarmlist_array, 'alarm from line');
          for (let i = 0; i < alarmlist_array.length; i++) {
            localStorage.setItem(
              alarmlist_array[i]['alarm-reported-timestamp'].substring(4, 7),
              parseInt(
                localStorage.getItem(
                  alarmlist_array[i]['alarm-reported-timestamp'].substring(4, 7)
                )
              ) + 1
            );
          }
          setProduct([
            {
              name: sessionStorage.getItem('unique_id'),
              data: [
                parseInt(localStorage.getItem('Jan')),
                parseInt(localStorage.getItem('Feb')),
                parseInt(localStorage.getItem('Mar')),
                parseInt(localStorage.getItem('Apr')),
                parseInt(localStorage.getItem('May')),
                parseInt(localStorage.getItem('Jun')),
                parseInt(localStorage.getItem('Jul')),
                parseInt(localStorage.getItem('Aug')),
                parseInt(localStorage.getItem('Sep')),
                parseInt(localStorage.getItem('Oct')),
                parseInt(localStorage.getItem('Nov')),
                parseInt(localStorage.getItem('Dec'))
              ]
            }
          ]);
        }
      
        getData();
      }, [data, setProduct]);

      function updateDimension () {
        let height;

        if(window.innerWidth === 768){
          height = 150;
        }
        else if(window.innerWidth === 1024){
          height = 230;
        }
        else if(window.innerWidth === 1366){
          height = 220;
        }
        else if(window.innerWidth === 1920){
          height = 360;
        }
        else if (window.innerWidth === 1440){
          height = 300;
        }
        
        setHeight(height);
      }
      

    return(
        <div className='container-fluid mt-3 mb-3' style={{width : window.innerWidth>786 ? "100%" : "90%"}}>
            <Chart 
                type='line'
                width={'100%'}
                height={heightd}
                series={product}
                options={option }
            />
        </div>
    );
}

export default Linechart;
