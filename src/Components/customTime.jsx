import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CustomTime = ({dataCallBack,dateCustom}) => {
  const [selectedUnit, setSelectedUnit] = useState("hour");
  const [opencustomizedTime, setOpenCustomizedTime] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedStopTime, setSelectedStopTime] = useState(null);

  const [timestampFilter, setTimestampFilter] = useState({
    start_time: new Date(),
    interval: null,
    stop_time: new Date(),
  });
  const [stepTimeInterval, setStepTimeInterval] = useState(1);
  const [unitInterval, setUnitInterval] = useState("d");

  const handleStepTimeInterval = (value) => {
    if (unitInterval === "m") {
      if (value < 5) {
        alert("Step time interval in minutes should not be less than 5.");
        setStepTimeInterval(5);
      } else {
        setStepTimeInterval(value);
        setTimestampFilter((prev) => ({ ...prev, interval: value }));
      }
    } else {
      if (value < 1) {
        alert("Have some sense.");
      } else {
        setStepTimeInterval(value);
        setTimestampFilter((prev) => ({ ...prev, interval: value }));
      }
    }
  };

  const convertDateFormat = (date) => {
    const inputDate = new Date(date);
    return inputDate.toISOString();
  };

    useEffect(() => {
      setTime("hour");
    }, []); 

    useEffect(() => {
      dataCallBack(timestampFilter);
    }, [timestampFilter]); 


  const setTime = (id) => {
    const currentDate = new Date();
    const AgoData = new Date(currentDate);
    let timestampFilterUpdates = [];

    if (id === "24hour") {
      timestampFilterUpdates = [];
      AgoData.setHours(currentDate.getHours() - 24);
      // 1 hour in milliseconds
      setTimestampFilter((prev) => ({
        ...prev,
        start_time: convertDateFormat(AgoData),
        stop_time: convertDateFormat(currentDate),
        interval:"1h"
      }));
    } else if (id === "week") {
      timestampFilterUpdates = [];
      AgoData.setDate(currentDate.getDate() - 7);
      setTimestampFilter((prev) => ({
        ...prev,
        start_time: convertDateFormat(AgoData),
        stop_time: convertDateFormat(currentDate),
        interval:"1d"
      }));
    } else if (id === "month") {
      AgoData.setMonth(currentDate.getMonth() - 1);
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Calculate the last month's start and end dates
      const lastMonthStart = new Date(
        currentYear,
        currentMonth - 1,
        currentDate.getDate()
      );
      const lastMonthEnd = new Date(
        currentYear,
        currentMonth,
        currentDate.getDate()
      );

      // Generate dates for the last month
      const currentDateCopy = new Date(lastMonthStart);
      while (currentDateCopy <= lastMonthEnd) {
        timestampFilterUpdates = [];
        const day = currentDateCopy.getDate();
        const month = currentDateCopy.getMonth();
        let year = currentDateCopy.getFullYear();
        currentDateCopy.setDate(day + 1);

        if (currentDateCopy.getMonth() !== month) {
          // Month has changed, so update the year
          year += 1;
        }
        const formattedCurrentDate = convertDateFormat(AgoData);
        const formattedAgoData = convertDateFormat(currentDate);
        let obj = {
          formattedCurrentDate: convertDateFormat(currentDate),
          formattedAgoData: convertDateFormat(AgoData),
        };
        !timestampFilterUpdates.includes(obj) &&
          timestampFilterUpdates.push({
            start_time: formattedAgoData,
            stop_time: formattedCurrentDate,
          });
        setTimestampFilter((prev) => ({
          ...prev,
          start_time: formattedCurrentDate,
          stop_time: formattedAgoData,
          interval:"1w"
        }));
      }
    } else if (id === "year") {
      timestampFilterUpdates = [];
      AgoData.setFullYear(currentDate.getFullYear() - 1);
      setTimestampFilter((prev) => ({
        ...prev,
        start_time: convertDateFormat(AgoData),
        stop_time: convertDateFormat(currentDate),
        interval:"1m"
      }));
      console.log(timestampFilter, "year");
    } else if (id === "hour") {
      timestampFilterUpdates = [];
      AgoData.setHours(currentDate.getHours() - 1);
      if (id !== "alreadyset") {
        setTimestampFilter((prev) => ({
          ...prev,
          start_time: convertDateFormat(AgoData),
          stop_time: convertDateFormat(currentDate),
          interval:"10m"
        }));
      }
    }
  };

  const onFormSubmit = () => {
    let obj = {
      start_time : convertDateFormat(timestampFilter.start_time),
      stop_time :  convertDateFormat(timestampFilter.stop_time),
      interval :   stepTimeInterval+unitInterval
    }
    dateCustom &&  dateCustom(obj)
    
  };

  const handleTimeChange = (type) => {
    setSelectedUnit(type);
    if (type !== "custom time range") {
      setTime(type);
      setOpenCustomizedTime(false);
    } else {
      setTimestampFilter(() => ({
        start_time: new Date(),
        interval: null,
        stop_time: new Date(),
      }));
      setOpenCustomizedTime(true);
    }
    dataCallBack(timestampFilter)
  };

  return (
    <div>
    <div style={{ display: "flex" }}>
      <select
        className="intervalLabel"
        style={{ width: "21%",marginLeft:"-4%",marginTop: "1%" }}
        value={selectedUnit}
        onChange={(e) => {
          handleTimeChange(e.target.value);
        }}
      >
        <option value="hour">Last Hour</option>
        <option value="24hour">Last 24 Hour</option>
        <option value="week">Last Week</option>
        <option value="month">Last Month</option>
        <option value="year">Last Year</option>
        <option value="custom time range">Custom Time Range</option>
      </select>  
    </div>
    {opencustomizedTime ? (
        <div style={{ display: "flex", marginTop:"10px"}}>
          <div>
            <form onSubmit={onFormSubmit}>
              <div className="form-group" style={{marginTop: "9px"}}>
                <DatePicker
                  selected={
                    selectedStartTime ? timestampFilter.start_time : null
                  }
                  onChange={(e) => {
                    const a = { ...timestampFilter };
                    const d = new Date(e);
                    a.start_time = d;
                    setTimestampFilter(a);
                    setSelectedStartTime(d);
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={20}
                  timeCaption="time"
                  dateFormat="MMMM d, yyyy h:mm aa"
                  placeholderText="Select start time" // Placeholder text instead of current date
                  className="small-date-time-picker"
                />
              </div>
            </form>
          </div>

          <div style={{ marginLeft: "1%" }}>
            <form onSubmit={onFormSubmit}>
              <div className="form-group" style={{marginTop: "9px"}}>
                <DatePicker
                  selected={selectedStopTime ? timestampFilter.stop_time : null}
                  onChange={(e) => {
                    const a = { ...timestampFilter };
                    const d = new Date(e);
                    a.stop_time = d;
                    setTimestampFilter(a);
                    setSelectedStopTime(d);
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={20}
                  timeCaption="time"
                  dateFormat="MMMM d, yyyy h:mm aa"
                  placeholderText="Select stop time" // Placeholder text instead of current date
                  className="small-date-time-picker"
                />
              </div>
            </form>
          </div>
          <div style={{ marginLeft: "31px", display: "flex" }}>
            <div style={{marginTop: "-11px"}}>
              <div style={{ fontWeight: "500", fontSize: "small",marginBottom:"15px",paddingBottom:"10px" }}>
                Interval:
              </div>
              <div style={{ display: "flex",marginTop:"-25px" }}>
                <input
                  type="number"
                  className="intervalLabel"
                  value={stepTimeInterval}
                  onChange={(event) => {
                    handleStepTimeInterval(event.target.value);
                  }}
                />
                <select
                  className="intervalLabel"
                  style={{ width: "fit-content" }}
                  value={unitInterval}
                  onChange={(event) => {
                    setUnitInterval(event.target.value);
                  }}
                >
                  <option value="d">Days</option>
                  <option value="h">Hours</option>
                  <option value="m">Minutes</option>
                </select>
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary mb-3"
            style={{ marginLeft: "10%", borderRadius:"4px", marginTop: "1%" }}
            onClick={() => {
              onFormSubmit();
            }}
          >
            Submit
          </button>
        </div>
      ) : null}
    </div>
    
  );
};

export default CustomTime;
