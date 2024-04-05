import React, { useRef, useState } from 'react';
import { IgrLinearGauge } from 'igniteui-react-gauges';
import { IgrLinearGraphRange } from 'igniteui-react-gauges';
import { LinearGraphNeedleShape } from 'igniteui-react-gauges';
import { IgrLinearGaugeModule } from 'igniteui-react-gauges';

IgrLinearGaugeModule.register();

const LinearGaugeAnimation = React.memo(({ data }) => {
  const [selectedHeading, setSelectedHeading] = useState(0);
  const [selected, setSelected] = useState(0);
  const [TempValue,setTempValue] = useState(0)
  const [third,setThird] = useState(false)
  var sections = [data.slice(0, 5), [data[5]], data.slice(6)];
  sections = sections.map(function(section) {
    return section.filter(function(item) {
      return 'state' in item && 'temperature' in item.state;
    });
  });
  const [heading, setHeading] = useState(sections[0].map(item => item.name));
  const gaugeRef = useRef(null);
  let shouldAnimate = false;

  const onGaugeRef = (component) => {
    if (component) {
      gaugeRef.current = component;
      if(heading.length===5){
        onAnimateToGauge1(sections[0]);
      }
      else if(heading.length===1){
        onAnimateToGauge2(sections[1]);
      }
      else{
        onAnimateToGauge3(sections[2]);
      }
    }
  };

  const onAnimateToGauge1 = (sectionData) => {
    if (!gaugeRef.current) return;

    shouldAnimate = true;
    gaugeRef.current.transitionDuration = shouldAnimate ? 1000 : 0;
    var currentTemp = parseInt(sectionData[parseInt(selected)].state.temperature.instant);
    setTempValue(currentTemp)

    // linear gauge requires settings for these properties:
    gaugeRef.current.minimumValue = -40;
    gaugeRef.current.maximumValue = 100;
    gaugeRef.current.value = currentTemp;
    gaugeRef.current.interval = 20;
    gaugeRef.current.labelInterval = 20;
    gaugeRef.current.labelExtent = 0.0;
  
    // setting custom appearance of needle
    gaugeRef.current.isNeedleDraggingEnabled = true;
    gaugeRef.current.needleShape = LinearGraphNeedleShape.Triangle;
    gaugeRef.current.needleBrush = "#79797a";
    gaugeRef.current.needleOutline = "#ffffffff";
    gaugeRef.current.needleStrokeThickness = 1;
    gaugeRef.current.needleOuterExtent = 0.9;
    gaugeRef.current.needleInnerExtent = 0.3;
  
    // setting custom appearance of major/minor ticks
    gaugeRef.current.minorTickCount = 4;
    gaugeRef.current.minorTickEndExtent = 0.10;
    gaugeRef.current.minorTickStartExtent = 0.20;
    gaugeRef.current.minorTickStrokeThickness = 1;
    gaugeRef.current.tickStartExtent = 0.25;
    gaugeRef.current.tickEndExtent = 0.05;
    gaugeRef.current.tickStrokeThickness = 2;
  
    // setting custom gauge ranges
    const range1 = new IgrLinearGraphRange({});
    range1.startValue = -40;
    range1.endValue = -20;
    const range2 = new IgrLinearGraphRange({});
    range2.startValue = -20;
    range2.endValue = 0;
    const range3 = new IgrLinearGraphRange({});
    range3.startValue = 0;
    range3.endValue = 80;
    const range4 = new IgrLinearGraphRange({});
    range4.startValue = 80;
    range4.endValue = 90;
    const range5 = new IgrLinearGraphRange({});
    range5.startValue = 90;
    range5.endValue = 100;
  
    gaugeRef.current.rangeBrushes = ["#21A7FF","#0099FF", "#0078C8", "#0078C8","#0099FF"];
    gaugeRef.current.rangeOutlines = ["#21A7FF", "#0099FF", "#0078C8", "#0078C8","#0099FF"];
    gaugeRef.current.ranges.clear();
    gaugeRef.current.ranges.add(range1);
    gaugeRef.current.ranges.add(range2);
    gaugeRef.current.ranges.add(range3);
    gaugeRef.current.ranges.add(range4);
    gaugeRef.current.ranges.add(range5);
  
  
  };

  const onAnimateToGauge2 = (sectionData) => {
    // setHeading(sections[1].map(item => item.name)) 
    if (!gaugeRef.current) return;

    shouldAnimate = true;
    gaugeRef.current.transitionDuration = shouldAnimate ? 1000 : 0;


    var currentTemp = parseInt(sectionData[0].state.temperature.instant);
    setTempValue(currentTemp)
    // setHeading(['Chip']);

    gaugeRef.current.minimumValue = 0;
    gaugeRef.current.maximumValue = 95;
    gaugeRef.current.value = currentTemp;
    gaugeRef.current.interval = 20;

    gaugeRef.current.labelInterval = 20;
    gaugeRef.current.labelExtent = 0.0;
  
    // setting custom appearance of needle
    gaugeRef.current.isNeedleDraggingEnabled = true;
    gaugeRef.current.needleShape = LinearGraphNeedleShape.Triangle;
    gaugeRef.current.needleBrush = "#79797a";
    gaugeRef.current.needleOutline = "#ffffffff";
    gaugeRef.current.needleStrokeThickness = 1;
    gaugeRef.current.needleOuterExtent = 0.9;
    gaugeRef.current.needleInnerExtent = 0.3;
  
    // setting custom appearance of major/minor ticks
    gaugeRef.current.minorTickCount = 4;
    gaugeRef.current.minorTickEndExtent = 0.10;
    gaugeRef.current.minorTickStartExtent = 0.20;
    gaugeRef.current.minorTickStrokeThickness = 1;
    gaugeRef.current.tickStartExtent = 0.25;
    gaugeRef.current.tickEndExtent = 0.05;
    gaugeRef.current.tickStrokeThickness = 2;
  
    // setting custom gauge ranges
    const range1 = new IgrLinearGraphRange({});
    range1.startValue = 0;
    range1.endValue = 10;
    const range2 = new IgrLinearGraphRange({});
    range2.startValue = 10;
    range2.endValue = 14;
    const range3 = new IgrLinearGraphRange({});
    range3.startValue = 14;
    range3.endValue = 75;
    const range4 = new IgrLinearGraphRange({});
    range4.startValue = 75;
    range4.endValue = 80;
    const range5 = new IgrLinearGraphRange({});
    range5.startValue = 80;
    range5.endValue = 95;
  
    gaugeRef.current.rangeBrushes = ["#21A7FF","#0099FF", "#0078C8", "#0078C8","#0099FF"];
    gaugeRef.current.rangeOutlines = ["#21A7FF", "#0099FF", "#0078C8", "#0078C8","#0099FF"];
    gaugeRef.current.ranges.clear();
    gaugeRef.current.ranges.add(range1);
    gaugeRef.current.ranges.add(range2);
    gaugeRef.current.ranges.add(range3);
    gaugeRef.current.ranges.add(range4);
    gaugeRef.current.ranges.add(range5);

  };

  const onAnimateToGauge3 = (sectionData) => {
    if (!gaugeRef.current) return;

    shouldAnimate = true;
    gaugeRef.current.transitionDuration = shouldAnimate ? 1000 : 0;


    var currentTemp = parseInt(sectionData[parseInt(selected)].state.temperature.instant);
    setTempValue(currentTemp)
    // setHeading(['1', '2', '3', '4', '5', '6', '7', '8']);

    gaugeRef.current.minimumValue = 0;
    gaugeRef.current.maximumValue = 93;
    gaugeRef.current.value = currentTemp;
    gaugeRef.current.interval = 20;

    gaugeRef.current.labelInterval = 20;
    gaugeRef.current.labelExtent = 0.0;
  
    // setting custom appearance of needle
    gaugeRef.current.isNeedleDraggingEnabled = true;
    gaugeRef.current.needleShape = LinearGraphNeedleShape.Triangle;
    gaugeRef.current.needleBrush = "#79797a";
    gaugeRef.current.needleOutline = "#ffffffff";
    gaugeRef.current.needleStrokeThickness = 1;
    gaugeRef.current.needleOuterExtent = 0.9;
    gaugeRef.current.needleInnerExtent = 0.3;
  
    // setting custom appearance of major/minor ticks
    gaugeRef.current.minorTickCount = 4;
    gaugeRef.current.minorTickEndExtent = 0.10;
    gaugeRef.current.minorTickStartExtent = 0.20;
    gaugeRef.current.minorTickStrokeThickness = 1;
    gaugeRef.current.tickStartExtent = 0.25;
    gaugeRef.current.tickEndExtent = 0.05;
    gaugeRef.current.tickStrokeThickness = 2;
  
    // setting custom gauge ranges
    const range1 = new IgrLinearGraphRange({});
    range1.startValue = 0;
    range1.endValue = 3;
    const range2 = new IgrLinearGraphRange({});
    range2.startValue = 3;
    range2.endValue = 6;
    const range3 = new IgrLinearGraphRange({});
    range3.startValue = 6;
    range3.endValue = 68;
    const range4 = new IgrLinearGraphRange({});
    range4.startValue = 68;
    range4.endValue = 73;
    const range5 = new IgrLinearGraphRange({});
    range5.startValue = 73;
    range5.endValue = 93;
  
    gaugeRef.current.rangeBrushes = ["#21A7FF","#0099FF", "#0078C8", "#0078C8","#0099FF"];
    gaugeRef.current.rangeOutlines = ["#21A7FF", "#0099FF", "#0078C8", "#0078C8","#0099FF"];
    gaugeRef.current.ranges.clear();
    gaugeRef.current.ranges.add(range1);
    gaugeRef.current.ranges.add(range2);
    gaugeRef.current.ranges.add(range3);
    gaugeRef.current.ranges.add(range4);
    gaugeRef.current.ranges.add(range5);
  

  };



  return (
    <div className="container sample">
      <div className="options horizontal">
        <button onClick={() => { setSelected(0);onAnimateToGauge1(sections[0]);setHeading(sections[0].map(item => item.name));setThird(false)}} className="options-button">Sensor</button>
        <button onClick={() => { onAnimateToGauge2(sections[1]); setHeading(sections[1].map(item => item.name));setThird(false)}} className="options-button">Chip</button>
        <button onClick={() => { setSelected(0); onAnimateToGauge3(sections[2]);  setHeading(sections[2].map(item => item.name));setThird(true)}} className="options-button">Core</button>
      </div>
      <div>
        <div className='horline' style={{  backgroundColor: '#d7d7d7',width:'100%' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(50px, 1fr))', gap: '10px' }}>
          {heading.map((item, index) => (
            <span onClick={() => {setSelected(index);setSelectedHeading(index);}} style={{ fontSize: third? '7px':'xx-small', display: 'block', textAlign: 'center', cursor: 'pointer',fontWeight: selectedHeading === index ? 'bold' : 'normal' }} key={index}>
              {item.split(' ').slice(1).join(' ')}
            </span>
          ))}
        </div>
        <div className='horline' style={{ backgroundColor: '#d7d7d7',width:'100%' }}></div>
      </div>

      <IgrLinearGauge
        ref={onGaugeRef}
        height="80px"
        width="100%"
        minimumValue={0}
        maximumValue={100}
        value={50}
        interval={10}
        labelInterval={20}
        labelExtent={0.05}
        tickStartExtent={0.1}
        tickEndExtent={0.15}
        tickStrokeThickness={1}
        minorTickCount={9}
        minorTickEndExtent={0.075}
        minorTickStartExtent={0.1}
        minorTickStrokeThickness={1}
        needleShape={LinearGraphNeedleShape.Triangle}
        needleEndExtent={0.475}
        needleStrokeThickness={1}
        needleBrush="gray"
        needleOutline="black"
        scaleBackgroundBrush="transparent"
        scaleBackgroundOutline="transparent"
        backingBrush="transparent"
        backingOutline="transparent">
        <IgrLinearGraphRange name="range1" startValue={0} endValue={100} brush="#e0e0e0" outline="#e0e0e0" />
        <IgrLinearGraphRange name="range2" startValue={0} endValue={95} brush="#0078C8" outline="#0078C8" />
        <IgrLinearGraphRange name="range3" startValue={0} endValue={93} brush="#33ABFF" outline="#33ABFF" />
      </IgrLinearGauge>
      <div style={{display:'flex',justifyContent:'center'}}>
      <div style={{color:'red',fontSize:'small',marginTop:'1%'}}>Temperature: {TempValue} &deg;C</div>
      <div style={{width:'8px',height:'8px',backgroundColor:'#0078C8',marginTop:'1.7%',marginLeft:'6%'}}></div>
      <div style={{fontSize:'small',marginTop:'1%',marginLeft:'1%'}}>Critical Region</div>
      <div style={{width:'8px',height:'8px',backgroundColor:'#0099FF',marginTop:'1.7%',marginLeft:'2%'}}></div>
      <div style={{fontSize:'small',marginTop:'1%',marginLeft:'1%'}}>Alert Region</div>
      <div style={{width:'8px',height:'8px',backgroundColor:'#21A7FF',marginTop:'1.7%',marginLeft:'2%'}}></div>
      <div style={{fontSize:'small',marginTop:'1%',marginLeft:'1%'}}>Normal Region</div>
      </div>
    </div>
  );
});

export default LinearGaugeAnimation;
