import React, { useEffect, useRef } from 'react';
import anychart from 'anychart';

function VerticalLinearGauge({data}) {
  console.log(data,'Thermal-DATA')
  const containerRef = useRef(null);
  useEffect(() => {
    anychart.onDocumentReady(function () {
      // Create table to place gauges
      var layoutTable = anychart.standalones.table();
      layoutTable
        .hAlign('center')
        .vAlign('middle')
        .useHtml(true)
        .fontSize(16)
        .cellBorder(null);
    
      // Put gauges into the layout table
      layoutTable.contents([
        [null, null, null, null, null],
        [
          null,
          'Sensor',
          'Chip',
          'Core',
          null
        ],
        [
          null,
          createGauge([
            {
              name: 'MaxC',
              volume: '',
              low: '0',
              high: '80',
            },
            {
              name: 'MaxA',
              volume: 'Alert Region',
              low: '80',
              high: '90',
            },
            {
              name: 'MaxE',
              volume: 'Emergency Region',
              low: '90',
              high: '100',
            },
            {
              name: 'MinC',
              volume: 'Alert Region',
              low: '-20',
              high: '0',
            },
            {
              name: 'MinA',
              volume: 'Emergency Region',
              low: '-45',
              high: '-20',
            },
            ...(data[0].state.temperature
              ? [
                  {
                    name: '',
                    volume: 'Local Sensor',
                    low: data[0].state.temperature.instant,
                    high: data[0].state.temperature.instant,
                  },
                ]
              : []),
            ...(data[1].state.temperature
              ? [
                  {
                    name: '',
                    volume: 'Remote Sensor',
                    low: data[1].state.temperature.instant,
                    high: data[1].state.temperature.instant,
                  },
                ]
              : []),
            ...(data[2].state.temperature
              ? [
                  {
                    name: '',
                    volume: 'Sensor-1',
                    low: data[2].state.temperature.instant,
                    high: data[2].state.temperature.instant,
                  },
                ]
              : []),
            ...(data[3].state.temperature
              ? [
                  {
                    name: '',
                    volume: 'Sensor-2',
                    low: data[3].state.temperature.instant,
                    high: data[3].state.temperature.instant,
                  },
                ]
              : []),
            ...(data[4].state.temperature
              ? [
                  {
                    name: '',
                    volume: 'Sensor-3',
                    low: data[4].state.temperature.instant,
                    high: data[4].state.temperature.instant,
                  },
                ]
              : []),
          ]),      
          createGauge([
                {
                  name: 'MaxA',
                  volume: 'Alert Region',
                  low: '75',
                  high: '80'
                },
                {
                  name: 'MaxE',
                  volume: 'Emergency Region',
                  low: '80',
                  high: '95'
                },
                {
                  name: 'MaxC',
                  volume: '',
                  low: '14',
                  high: '75'
                },
                {
                  name: 'MinC',
                  volume: 'Alert Region',
                  low: '10',
                  high: '14'
                },
                {
                  name: 'MinA',
                  volume: 'Emergency Region',
                  low: '0',
                  high: '10'
                },
                ...(data[5].state.temperature
                  ? [
                      {
                        name: '',
                        volume: 'Sensor-2',
                        low: data[5].state.temperature.instant,
                        high: data[5].state.temperature.instant
                      },
                    ]
                  : []),
          ]),
          createGauge([
            {
              name: 'MaxE',
              volume: 'Emergency Region',
              low: '73',
              high: '93',
            },
            {
              name: 'MaxA',
              volume: 'Alert Region',
              low: '68',
              high: '73',
            },
            {
              name: 'MaxC',
              volume: '',
              low: '6',
              high: '68',
            },
            {
              name: 'MinC',
              volume: 'Alert Region',
              low: '3',
              high: '6',
            },
            {
              name: 'MinA',
              volume: 'Emergency Region',
              low: '0',
              high: '3',
            },
            ...(data[6].state.temperature
              ? [
                  {
                    name: '',
                    volume: 'CPU Core ID 0',
                    low: data[6].state.temperature.instant,
                    high: data[6].state.temperature.instant,
                  },
                ]
              : []),
            ...(data[7].state.temperature
              ? [
                  {
                    name: '',
                    volume: 'CPU Core ID 2',
                    low: data[7].state.temperature.instant,
                    high: data[7].state.temperature.instant,
                  },
                ]
              : []),
            ...(data[8].state.temperature
              ? [
                  {
                    name: '',
                    volume: 'CPU Core ID 4',
                    low: data[8].state.temperature.instant,
                    high: data[8].state.temperature.instant,
                  },
                ]
              : []),
            ...(data[9].state.temperature
              ? [
                  {
                    name: '',
                    volume: 'CPU Core ID 6',
                    low: data[9].state.temperature.instant,
                    high: data[9].state.temperature.instant,
                  },
                ]
              : []),
            // Check if data[10] exists
            data[10]
              ? {
                  name: '',
                  volume: 'CPU Core ID 8',
                  low: data[10].state.temperature.instant,
                  high: data[10].state.temperature.instant,
                }
              : null,
            data[11]
              ? {
                  name: '',
                  volume: 'CPU Core ID 10',
                  low: data[11].state.temperature.instant,
                  high: data[11].state.temperature.instant,
                }
              : null,
            data[12]
              ? {
                  name: '',
                  volume: 'CPU Core ID 12',
                  low: data[12].state.temperature.instant,
                  high: data[12].state.temperature.instant,
                }
              : null,
            data[13]
              ? {
                  name: '',
                  volume: 'CPU Core ID 14',
                  low: data[13].state.temperature.instant,
                  high: data[13].state.temperature.instant,
                }
              : null,
          ]),
          
          null
        ]
      ]);
    
      // Set height for first row in layout table
      layoutTable.getCol(0).width('10%');
      layoutTable.getCol(4).width('10%');
      layoutTable
        .getRow(0)
        .height(30)
        .fontSize(16)
        .fontColor('#212121')
        .vAlign('bottom');
      layoutTable.getRow(1).height(30).fontSize(13);
      layoutTable.getCell(1, 1).border().bottom('3 #EAEAEA');
      layoutTable.getCell(1, 2).border().bottom('3 #EAEAEA');
      layoutTable.getCell(1, 3).border().bottom('3 #EAEAEA');
    
      // Merge cells in layout table where needed
      layoutTable.getCell(0, 1).colSpan(3).border().bottom('3 #EAEAEA');
    
      // Set container id and initiate drawing
      layoutTable.container(containerRef.current);
      layoutTable.draw();
    
      // Helper function to define color
    
      // Helper function to create gauge

    });
});

  function createGauge(data) {
  // Create new gauge
  var gauge = anychart.gauges.linear();
  gauge.data(anychart.data.set(data).mapAs({ value: 'high' }));
  gauge.padding([0, 0, 0, 0]).tooltip(false);
  gauge.scale().maximumGap(0.02).ticks([]);
    console.log(data)
  // Create bar and marker points for gauge
  for (var i = 0; i < data.length; i++) {
    if(data[i]){
    var bar = gauge.rangeBar(i);
      bar.width('30%').color(defineColor(data[i].name));

    // Set label for bar point
    bar
      .labels()
      .enabled(true)
      .position('center')
      .fontColor('#212121')
      .anchor('center')
      .fontSize(6)
      .format(function () {
        return this.getData('volume') + '';
      });
    bar
      .hovered()
      .labels()
      .enabled(true)
      .fontColor('#212121')
      .fontWeight('600');
    bar
      .selected()
      .labels()
      .enabled(true)
      .fontColor('#212121')
      .fontWeight('600');

    // Create marker point
    var marker = gauge.marker(i);
    marker.color('#545f69').offset('31%').type('triangle-left');

    // Set label for marker point
    marker
      .labels()
      .enabled(true)
      .position('right-center')
      .anchor('left-center')
      .format('{%Value}*C')
    marker
      .hovered()
      .labels()
      .enabled(true)
      .fontColor('#212121')
      .fontWeight('600');
    marker
      .selected()
      .labels()
      .enabled(true)
      .fontColor('#212121')
      .fontWeight('600');
  }
  }
  return gauge;
  }

  function defineColor(name) {
    switch (name) {
      case 'MaxE':
        return 'red';
      case 'MaxC':
        return '#B9D6F2';
      case 'MaxA':
        return 'orange';
      case 'MinC':
        return 'orange';
      case 'MinA':
        return 'red';
      default:
          return '#B9D6F2';
    }
  }

  return (
    <div style={{height:'70vh'}} ref={containerRef}></div>
    );
}

export default VerticalLinearGauge;