import React, { useEffect } from 'react';
import ApexCharts from 'apexcharts';

const DeviceType = ({ chartId }) => {
  useEffect(() => {
    var options = {
        series: [{
        name: 'Disconnected',
        data: [44, 55]
      }, {
        name: 'Connected',
        data: [53, 32]
      }],
        chart: {
        type: 'bar',
        height: 310,
        stacked: true,
      },
      plotOptions: {
        bar: {
          horizontal: true,
          dataLabels: {
            total: {
              enabled: true,
              offsetX: 0,
              style: {
                fontSize: '13px',
                fontWeight: 900
              }
            }
          }
        },
      },
      stroke: {
        width: 1,
        colors: ['#fff']
      },
      xaxis: {
        categories: ['Bangalore', 'Delhi'],
        labels: {
          formatter: function (val) {
            return val 
          }
        }
      },
      yaxis: {
        title: {
          text: undefined
        },
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val
          }
        }
      },
      fill: {
        opacity: 1
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'left',
        offsetX: 40
      }
      };

      var chart = new ApexCharts(document.querySelector(`#${chartId}`), options);
      chart.render();
    return () => {
      chart.destroy();
    };
  }, [chartId]);

  return <div id={chartId} />;
};

export default DeviceType;
