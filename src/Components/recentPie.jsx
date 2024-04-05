import React, { useEffect } from 'react';
import ApexCharts from 'apexcharts';

const BarChart = ({ chartId }) => {
  useEffect(() => {
    var options = {
      series: [14, 23, 21, 17, 15],
      chart: {
        type: 'polarArea',
      },
      stroke: {
        colors: ['#fff']
      },
      fill: {
        opacity: 0.8
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 300
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      plotOptions: {
        polarArea: {
          dataLabels: {
            enabled: false // Hide the numbers behind the pie chart
          }
        }
      }
    };

    var chart = new ApexCharts(document.querySelector(`#${chartId}`), options);
    chart.render();

    // Clean up the chart when the component is unmounted
    return () => {
      chart.destroy();
    };
  }, [chartId]);

  return <div id={chartId} style={{ position: 'relative', width: '114%' }} />;
};

export default BarChart;
