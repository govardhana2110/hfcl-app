import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const FancyTable = () => {
  const data = [
    {
      deviceName: 'Device 1',
      clusterName: 'CSR',
      siteName: 'Site X, Cluster A',
      status: 'Active',
      memory: '4 GB',
    },
    {
      deviceName: 'Device 1',
      clusterName: 'CSR',
      siteName: 'Site X, Cluster A',
      status: 'Active',
      memory: '4 GB',
    },
    {
      deviceName: 'Device 1',
      clusterName: 'CSR',
      siteName: 'Site X, Cluster A',
      status: 'Active',
      memory: '4 GB',
    },
    {
      deviceName: 'Device 1',
      clusterName: 'CSR',
      siteName: 'Site X, Cluster A',
      status: 'Active',
      memory: '4 GB',
    },
    {
      deviceName: 'Device 1',
      clusterName: 'CSR',
      siteName: 'Site X, Cluster A',
      status: 'Active',
      memory: '4 GB',
    },
  ];

  return (
    <div className="card">
      <div className="card-header" style={{color:'rgb(52, 71, 103)',fontWeight:'bold'}}>Recent Alarms</div>
      <div>
      <table className='user_table'>
      <thead className='user_table_head'> 
        <tr style={{backgroundColor:'#e5e8ff',color:'black'}}>
              <th>Device Name</th>
              <th>IP</th>
              <th>Time Created</th>
              <th>Resources</th>
              <th>Text</th>
              <th>Timestamp</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FancyTable;
