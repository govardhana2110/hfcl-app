import React, { useEffect } from 'react';
import ApexCharts from 'apexcharts';

const DeviceType = ({ data, chartId, heading, unit, width, height, xAxis,name }) => {
  useEffect(() => {
    var options = {
      series: [{
        name: name,
        data: data,
      }],
      chart: {
        height: height,
        width: width,
        type: 'line',
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'straight',
      },
      tooltip: {
        y: {
          formatter: function (value) {
            return Math.round(value) + " " + unit; // Add ' units' to the tooltip value
          },
        },
      },
      title: {
        text: heading,
        align: 'left',
        style: {
          fontSize: '15px', // Change the font size as needed
          fontWeight: 'medium', // Add font weight if needed (e.g., bold)
        },
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5,
        },
      },
      yaxis: {
        labels: {
          formatter: function (value) {
            return Math.round(value).toString(); // Display only numbers on y-axis labels
          },
        },
        title: {
          text: unit, // Set the common unit as the y-axis title
        },
      },
      xaxis: {
        categories: xAxis, // Use the xAxis array as categories
        labels: {
          formatter: function (value) {
            return value ? value.toString() : ''; 
          },
          style: {
            fontSize: '0.6rem',
          },
        },
      },
      
    };

    var chart = new ApexCharts(document.querySelector(`#${chartId}`), options);
    chart.render();
    return () => {
      chart.destroy();
    };
  }, [chartId, data, xAxis]);

  return <div id={chartId} />;
};

export default DeviceType;
