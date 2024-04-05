import React from 'react';
import ReactApexChart from 'react-apexcharts';

const PieChart = ({data,labels}) => {
  console.log(data)
  var series = [0,0,0,0]
  for(let i=0;i<data.length;i++){
    if(data[i].role==='NETWORK-ADMIN'){
      series[0] = series[0] + 1
    }
    else if(data[i].role==='NETWORK-ENGINEER'){
      series[1] = series[1] + 1
    }
    else if(data[i].role==='NETWORK-OPERATOR'){
      series[2] = series[2] + 1
    }
    else if(data[i].role==='NETWORK-USER'){
      series[3] = series[3] + 1
    }
  }
  const chartData = {
    series: series,
    options: {
      labels: labels,
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
        ):<div>NO USERS EXIST</div>}
    </div>
  );
};

export default PieChart;
