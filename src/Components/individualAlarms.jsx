import React, { useEffect } from 'react';
import ApexCharts from 'apexcharts';

const BarChart = ({ chartId, critical, major, minor, warning }) => {
  useEffect(() => {
    var options = {
      series: [
        {
          name: 'Warning',
          data: [warning],
        },
        {
          name: 'Minor',
          data: [minor],
        },
        {
          name: 'Major',
          data: [major],
        },
        {
          name: 'Critical',
          data: [critical],
        },
      ],
      chart: {
        type: 'bar',
        height: 70,
        width:300,
        stacked: true,
        toolbar: {
          show: false, // Hide the toolbar
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          dataLabels: {
            enabled: false, // Hide the data labels
          },
        },
      },
      stroke: {
        width: 1,
        colors: ['#fff'],
      },
      xaxis: {
        categories: ['Device'],
        labels: {
          show: false, // Hide the x-axis labels
        },
        axisBorder: {
          show: false, // Hide the x-axis border
        },
        axisTicks: {
          show: false, // Hide the x-axis ticks
        },
      },
      yaxis: {
        show: false, // Hide the y-axis
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val;
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        show: false, // Hide the legend
      },
    };

    var chart = new ApexCharts(document.querySelector(`#${chartId}`), options);
    chart.render();

    // Clean up the chart when the component is unmounted
    return () => {
      chart.destroy();
    };
  }, [chartId]);

  return <div id={chartId} style={{ position: 'relative', lineHeight: 0,border:'0'}} />;
};

export default BarChart;
