import React, { useEffect } from 'react';
import ApexCharts from 'apexcharts';

const DeviceType = ({ chartId, data }) => {
  var csr = 0
  var duar = 0
  var cuar = 0
  data.map((item)=>{
    item['device_type']==="csar"?csr += 1 :item['device_type']==="duar"? duar+=1:cuar += 1
  })

  useEffect(() => {
    var options = {
      series: [{
      name: 'Connected Devices',
      data: [csr,duar,cuar]
    }],
      chart: {
      height: 260,
      type: 'bar',
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        dataLabels: {
          position: 'top', // top, center, bottom
        },
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val;
      },
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ["#304758"]
      }
    },
    
    xaxis: {
      categories: ["CSAR",'DUAR','CUAR'],
      position: 'top',
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      crosshairs: {
        fill: {
          type: 'gradient',
          gradient: {
            colorFrom: '#D8E3F0',
            colorTo: '#BED1E6',
            stops: [0, 100],
            opacityFrom: 0.4,
            opacityTo: 0.5,
          }
        }
      },
      tooltip: {
        enabled: true,
      }
    },
    yaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: false,
        formatter: function (val) {
          return val;
        }
      }
    
    },
    title: {
      text: 'Connected Devices',
      floating: true,
      offsetY: 330,
      align: 'center',
      style: {
        color: '#444'
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

  return <div id={chartId} />;
};

export default DeviceType;
