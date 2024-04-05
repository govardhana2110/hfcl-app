import React, { useEffect } from 'react';
import ApexCharts from 'apexcharts';

const DeviceType = ({ chartId }) => {
  useEffect(() => {
    var options = {
        series: [76, 67],
        chart: {
        height: 300,
        type: 'radialBar',
      },
      plotOptions: {
        radialBar: {
          offsetY: 0,
          startAngle: 0,
          endAngle: 270,
          hollow: {
            margin: 5,
            size: '30%',
            background: 'transparent',
            image: undefined,
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              show: false,
            }
          }
        }
      },
      colors: ['#1ab7ea', '#0084ff'],
      labels: ['Bandwith Usage', 'Error Rate'],
      legend: {
        show: true,
        floating: true,
        fontSize: '10px',
        position: 'right',
        offsetX: 120,
        offsetY: 15,
        labels: {
          useSeriesColors: true,
        },
        markers: {
          size: 0
        },
        formatter: function(seriesName, opts) {
          return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
        },
        itemMargin: {
          vertical: 3
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          legend: {
              show: false
          }
        }
      }]
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
