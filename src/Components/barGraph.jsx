import React ,{  useEffect} from "react";
import Chart from "react-apexcharts";
function Barchart({data}) {
  useEffect(()=>{
    if(data){
      // console.log(data)
    }
    });
  return (
      <div className="container-fluid mb-5" style={{marginTop:'-20px'}}>
        <Chart
          type="bar"
          width={'100%'}
          height={205}
          series={[
            {
              name: "Device",
              data: [data['cpu-utilization'], data['cpu-1min-load-percentage'], data['cpu-5min-load-percentage'], data['cpu-15min-load-percentage']],
            },
          ]}
          options={{
            chart: {
                    toolbar: {
                        show: false
                    }
                },
            title: {
              text: "",
              style: { fontSize: 20 },
            },
            subtitle: {
              text: "",
              style: { fontSize: 18 },
            },
            colors: ["#2a7c97"],
            theme: { mode: "light" },
            xaxis: {
              tickPlacement: "on",
              categories: [
                "Instant",
                "1min",
                "5min",
                "15min",
              ],
              title: {
                text: "",
                style: { color: "#004f68", fontSize: 20 },
              },
            },
            yaxis: {
              labels: {
                formatter: (val) => {
                  return `${val}`;
                },
                style: { fontSize: "15", colors: ["#004f68"] },
              },
              title: {
                text: "",
                style: { color: "#004f68", fontSize: 15 },
              },
            },
            legend: {
              show: true,
              position: "right",
            },
            dataLabels: {
              formatter: (val) => {
                return `${val}`;
              },
              style: {
                colors: ["#f4f4f4"],
                fontSize: 15,
              },
            },
          }}
        ></Chart>
      </div>
  );
}
export default Barchart;