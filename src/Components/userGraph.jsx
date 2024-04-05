import React, { useEffect } from "react";
import ApexCharts from "apexcharts";

const DeviceType = ({ chartId, data }) => {
  var series = [
    { name: "Warning", data: Array(12).fill(0) },
    { name: "Minor", data: Array(12).fill(0) },
    { name: "Major", data: Array(12).fill(0) },
    { name: "Critical", data: Array(12).fill(0) },
  ];

  useEffect(() => {
    for (let i = 0; i < data.length; i++) {
      const timeSlice = getMonthFromTime(data[i]["alarm-reported-timestamp"]);

      if (timeSlice !== null) {
        const index = timeSlice;

        switch (data[i]["alarm-severity"]) {
          case "CRITICAL":
            series[3].data[index] += 1;
            break;
          case "MAJOR":
            series[2].data[index] += 1;
            break;
          case "MINOR":
            series[1].data[index] += 1;
            break;
          default:
            series[0].data[index] += 1;
        }
      }
    }

    var options = {
      series: series,
      chart: {
        height: 300,
        type: "area",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm",
        },
      },
    };

    var chart = new ApexCharts(document.querySelector(`#${chartId}`), options);
    chart.render();

    return () => {
      chart.destroy();
    };
  }, [chartId, data]);

  return <div id={chartId} />;
};

// Function to get month from different timestamp formats
const getMonthFromTime = (timestamp) => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.getMonth();
};

export default DeviceType;