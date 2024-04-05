import React from 'react';
import ReactApexChart from 'react-apexcharts';

const PieChart = ({connectedCount ,totaldevices}) => {
  // Sample data for the pie chart
  const chartData = {
    series: [totaldevices-connectedCount, connectedCount],
    options: {
      labels: ['Disconnected', 'Connected'],
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
        {parseInt(sessionStorage.getItem('deviceCount'))?(
          <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="pie"
        width="320"
      />
        ):<div>NO DEVICES PRESENT</div>}
    </div>
  );
};

export default PieChart;
