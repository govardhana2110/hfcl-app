import React from 'react';
import ReactApexChart from 'react-apexcharts';

const PieChart = ({data}) => {
  console.log(data)
  var series = [0,0,0,0]
  for(let i=0;i<data.length;i++){
    if(data[i]['alarm-severity']==='CRITICAL'){
      series[3] = series[3] + 1 
    }
    else if(data[i]['alarm-severity']==='MAJOR'){
      series[2] = series[2] + 1 
    }
    else if(data[i]['alarm-severity']==='MINOR'){
      series[1] = series[1] + 1 
    }
    else{
      series[0] = series[0] + 1 
    }
  }
  const chartData = {
    series: series,
    options: {
      labels: ['Warning', 'Minor', 'Major', 'Critical'],
      legend: {
        position: 'bottom',
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    },
  };

  return (
    <div>
    {chartData.series[0] ||chartData.series[1] ||chartData.series[2] ||chartData.series[3]?(
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="pie"
        width="320"
      />
    ):<div>NO ALARMS PRESENT</div>}
    </div>
  );
};

export default PieChart;
