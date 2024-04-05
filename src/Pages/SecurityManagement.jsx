import React, { useEffect, useState } from 'react'
import NewHeader from '../Components/header'
import '../css/SecurityManagementPage.css'
import axios from 'axios'
import notify from '../utils'
import uploadIcon from '../Images/uploadbg.png'


// generic function for api call
const fetchdata = async (
    method,
    endPoint,
    data = {}
) => {
   
    const baseURL ="http://"+process.env.REACT_APP_CLIENT_IP+':5010/'
    switch (method) {
        case "get":
            return await axios.get(baseURL+endPoint)

        case "post":
                return endPoint.includes('bulk-manage-hash')?  
                // for api's with form data / media
                await axios.post(baseURL+endPoint, data,{headers:{'Content-Type': 'multipart/form-data'}})
                // for api's without form data / media
                :axios.post(baseURL+endPoint,data)

        case "delete":
            return await axios.delete(baseURL+endPoint)
    
        default:
            return
    }
}

const scanFunc = async(method='post',endpoint,id,setDetails) =>{
    try{
    const {data} = await fetchdata(method, endpoint , {scan_id:id})
    console.log(data)
    if(setDetails!==undefined){
    setDetails(data)
    }
    }catch(err){
        console.log(err)
    }
}


const SecurityManagement = () => {
    const [tab,setTab] = useState("Directory")
    const [showModal ,setShowModal] = useState(false);
    const [type,setType] = useState();
    const [hashValues,setHashValues] = useState([])
    const [scanning, setScanning] = useState(false);
    const [directoryExclusions , setDirectoryExclusions] = useState([]);

    const handleModal=()=>{
        setShowModal(!showModal);
    }

    const updateScanner = async()=>{
        try{
            setScanning(true)
            const {data} = await fetchdata('get',"security-management/update-scanner")
            data.status.map((i,index)=>setTimeout(()=>notify(i),1000*index))
            setScanning(false)
        }catch(err){
            notify('Something went wrong','error')
            setScanning(false)
        }
    }

    const scanHistory = async(collection,setHistory) =>{
        try{
            const {data} = await fetchdata('post',"security-management/get-scan-history",{
                "collection": collection
            })
             setHistory(data.data)

        }catch(err){
            console.log(err,"---err history----")
            notify('Something went wrong','error')
        }
    }

    const uploadCSV = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                // Check file type
                if (!file.name.endsWith('.csv') || file.type !== 'text/csv') {
                    throw new Error('Please select a CSV file.');
                }
    
                const formData = new FormData(); // Instantiate FormData here
                formData.append('file', file);
                    
                    try {
                        await fetchdata('post', 'security-management/bulk-manage-hash-signature', formData);
                        handleModal()
                        notify('CSV file uploaded successfully!', 'success');
                    } catch (error) {
                        console.error('Error uploading CSV file:', error);
                        notify(`Error uploading CSV file: ${error.message}`, 'error');
                    }
              
            } catch (error) {
                console.error('Error:', error);
                notify(error.message, 'error');
            }
        } else {
            notify('Please select a file');
        }
    };
    
      const handleHashSignatures = async() =>{
        const data = {hashes:[],reasons:[]};
        for (let i=0;i<hashValues.length;i++){
            data.hashes.push(hashValues[i].hash)
            data.reasons.push(hashValues[i].reason)
        }
        try{
            const res = await fetchdata('post',"security-management/hash-signature",data)
             notify(res.data.status,'success')
             handleModal();
        }catch(err){
            handleModal();
            console.log(err)
            notify("Something went wrong",'error')
        }
      }
   
    const Modal = ({handleModal,type}) =>{
        const [input,setInput] = useState('')
        const [reason ,setReason] = useState('')
        const [bulkUpload ,setBulkUpload] = useState(false)

        return(
            <div className='security-modal-bg' onClick={handleModal}>
                <div className='security-modal' onClick={(e)=>e.stopPropagation()}>
                    {
                        type==='exclusion' &&  <div className='modal-content'>
                        <h4>Add Paths to Exclude</h4>
                        <input className='custom-input modal-input' value={input} placeholder='add path here' onChange={(e)=>{
                            e.preventDefault();
                            setInput(e.target.value)
                            }}/>
                        <div className='paths'>{directoryExclusions.map((i)=><div key={i} style={{display:'flex'}}>
                            <span style={{flex:1}}>{i}</span>
                            <span style={{textAlign:'end',cursor:'pointer'}} onClick={()=>{
                                let x = directoryExclusions.filter(e=>e!==i)
                                setDirectoryExclusions(x);
                            }}>&#10060;</span></div>)}</div>
                        <div className='modal-btn-wrap'>
                        <button className='security-primary' onClick={()=>{
                            if(input.length ===0) notify('Please enter a value','error')
                            else setDirectoryExclusions(prev=>[...prev,input])
                        }}>Add</button>
                        <button className='security-primary outline' onClick={handleModal}>Submit</button>
                        </div>
                        </div>
                    }
                    {type==='hash' && <>
                    <div className='modal-content'>
                        <h4>Add Hash Signature</h4>
                        <div>
                        <button className='security-primary' onClick={()=>setBulkUpload(e=>!e)}>{!bulkUpload?'Bulk Upload':"Cancel Bulk Upload"}</button>
                        </div>
                        { !bulkUpload ? <><input className='custom-input modal-input' value={input} placeholder='add hash here' onChange={(e)=>{
                            e.preventDefault();
                            setInput(e.target.value)
                            }}/>
                        <input className='custom-input modal-input' value={reason} placeholder='add reason here' onChange={(e)=>{
                            e.preventDefault();
                            setReason(e.target.value)
                            }}/>
                            <div className='paths'>
                                <table className='user_table table-margin'>
                                    <thead>
                                        <tr>
                                        <th>Hash</th>
                                        <th>Reason</th>
                                        <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hashValues.map((i) => (
                                        <tr key={i.hash}>
                                            <td>{i?.hash}</td>
                                            <td>{i.reason}</td>
                                            <td style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => {
                                            let x = hashValues.filter(e => e.hash !== i.hash);
                                            setHashValues(x);
                                            }}>&#10060;</td>
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>
                                </div></>:
                            <>
                            <h5>Bulk Upload</h5>
                            <div className='csv-input'>
                            <label htmlFor="fileInput" className="upload-label">
                            <img src={uploadIcon} alt="Upload Icon" className="upload-icon" />
                                    <p>Click here to upload</p>
                            </label>
                            <input type="file" id="fileInput" accept=".csv" onChange={(e)=>uploadCSV(e)} style={{ display: 'none' }} />
                            </div>
                            </>
                            }
                        {!bulkUpload && <div className='modal-btn-wrap'>
                        <button className='security-primary' onClick={()=>setHashValues(prev=>[...prev,{hash:input,reason:reason}])}>Add</button>
                        <button className='security-primary outline' onClick={()=>{
                            handleHashSignatures()
                            }}>Submit</button>
                        </div>}
                        </div>
                    </>
                    }
                </div>
            </div>
        )
    }

    const ScanDirectory = () =>{
        const [History , setHistory] = useState()
        const [directoryPath,setDirectoryPath] = useState('');
        const [directoryScanResult,setDirectoryScanResult] = useState();
        const [scanDetails,setScanDetails] = useState()
        const [loading,setLoading] = useState(false)
        const [scanning, setScanning] = useState(false);
        const [id , setId] = useState();


        const fetchDirectoryScanResult = async() =>{
           try{ 
            setLoading(true)
            setScanning(true)
            const {data} = await fetchdata('post','security-management/scan-directory',{
                "path": directoryPath,
                "exclusion_paths": directoryExclusions
            })
            if(data?.stream_id){
                setScanning(true)
                const eventSource = new EventSource(`http://${process.env.REACT_APP_CLIENT_IP}:5010/security-management/scan-directory?stream_id=${data?.stream_id}`);
                setLoading(false)
                eventSource.onmessage = (event) => {
                let  x =JSON.parse(event.data)
                setDirectoryScanResult(x)
                setId(x.scan_id)
                if(x.status==='COMPLETED') {
                    eventSource.close()
                    scanHistory("file-scan-results",setHistory)
                    setScanning(false)
                }
            };
    
            eventSource.onerror = (error) => {
                console.error('EventSource failed:', error);
                eventSource.close();
                // Handle error appropriately
            };
            eventSource.onclose = () => {
                console.log('SSE connection closed');
            };
            
        }           
        } catch(err){
            setLoading(false)
            setScanning(false)
            notify('Something went wrong','error')
        }
        }

        useEffect(()=>{ scanHistory("file-scan-results",setHistory)},[])

        console.log(id)
        return(
            <>
                <span>
                    <input type='text'  
                    placeholder='Enter directory path ...' 
                    className='custom-input' 
                    value={directoryPath} 
                    onChange={(e)=>{
                        e.preventDefault();
                        setDirectoryPath(e.target.value);
                    }}/>
                    {!scanning?<button className="security-primary" onClick={fetchDirectoryScanResult}>Scan Directory</button>
                    :<button className="security-primary" onClick={()=>{
                        try{
                            scanFunc('post','/security-management/stop-directory-scan',id)
                            setScanning(false)
                        }catch(err){
                            setScanning(false)
                            console.log(err)
                        }
                        }}>Stop Scanning</button>}
                    <button className={`security-primary outline ${scanning && 'btn-disabled'}`} onClick={()=>{
                        setType('exclusion')
                        handleModal();
                    }}>Add Exclusions</button>
                </span>
                <div className='content-wrapper'>
                    <div className='directory-result'>
                        <h3 >{tab} Scan Results</h3>
                            <div className='scan-wrapper'>
                                {loading && <>loading...</>}
                                {directoryScanResult && <>
                                <h5>Scanned {directoryScanResult.current_progress}% files</h5>
                                <progress value={directoryScanResult.current_progress} max={100} className='custom-progress'/>
                                    
                                    <section className='files'>{directoryScanResult?.filename && `Scanning:  ${directoryScanResult?.filename}`}</section>
                                    <h5>Status : {directoryScanResult.status.toLowerCase()}</h5>
                                    <table>
                                        <thead>
                                            <tr>
                                            <th>Creds</th>
                                            <th>Values</th>
                                            </tr>
                                        </thead>
                                    <tbody>
                                        {
                                    Object.entries(directoryScanResult.result).map(([key ,value])=>
                                        <tr>
                                            <td>{key}</td>
                                            <td>{value}</td>
                                        </tr>) 
                                        } 
                                    </tbody>
                                    </table>
                                    
                                </>}
                                {scanDetails && <div>{JSON.stringify(scanDetails)}</div> }
                            </div>
                    </div>
                    <div className='security-history'>
            <h3>{tab} Scan History</h3>
            <div className='scan-wrapper padding-history'>
            <table className='user_table table-margin'>
                    <thead>
                        <tr>
                        <th>Scan ID</th>
                        <th>Time Stamp</th>
                        <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                        History && Object.entries(History).reverse().map(([key ,value])=>
                        <tr>
                            <td>{key}</td>
                            <td>{value}</td>
                            <td>
                                <button className='security-primary history' onClick={()=>scanFunc('post','security-management/fetch-scan-directory',key,setScanDetails)}>
                                    Get Details
                                </button>
                            </td>
                        </tr>) 
                        } 
                    </tbody>
                </table>
                </div>
                    </div>
                </div>
            </>
        )
    }

    const ScanNetwork = () =>{
        const [History , setHistory] = useState()
        const [networkScanResult,setNetworkScanResult] = useState();
        const [loading,setLoading] = useState(false)
        const [scanning ,setScanning] = useState(false)
        const [scanDetails,setScanDetails] = useState()
        const scanNetwork = async() =>{
            setScanning(true)
            const eventSource = new EventSource(`http://${process.env.REACT_APP_CLIENT_IP}:5010/security-management/scan-network`);
            setLoading(false)
            eventSource.onmessage = (event) => {
                let  x =JSON.parse(event.data)
                console.log(x)
                setNetworkScanResult(x)
            if(x.status==='COMPLETED') {
                eventSource.close()
                scanHistory("network-scan-results",setHistory)
                setScanning(false);
            }
        };

        eventSource.onerror = (error) => {
            console.error('EventSource failed:', error);
            eventSource.close();
            // Handle error appropriately
        };
        eventSource.onclose = () => {
            console.log('SSE connection closed');
        };
        }

        useEffect(()=>{
            scanHistory("network-scan-results",setHistory)
        },[])
        return(
            <>
            <div className='CTA-wrapper'>
                <span>
                    <button className={`security-primary ${scanning && 'btn-disabled'}`} onClick={scanNetwork}>Scan Network</button>
                </span>
            </div>
            <div className='content-wrapper'>
            <div className='directory-result'>
                <h3>{tab} Scan Results</h3>
                <div className='scan-wrapper'>
                 {loading && <>loading...</>}
                     {networkScanResult && <>
                    <h5>Scanned {networkScanResult.current_progress}%</h5>
                       <progress value={networkScanResult.current_progress} max={100} className='custom-progress'/>
                        <h5>Status : {networkScanResult.status}</h5>
                        <table>
                            <thead>
                                <tr>
                                <th>Creds</th>
                                <th>Values</th>
                                </tr>
                            </thead>
                        <tbody>
                            {
                            Object.entries(networkScanResult.results).reverse().map(([key ,value])=>
                            <tr>
                                <td>{key}</td>
                                <td>{value}</td>
                            </tr>) 
                            } 
                        </tbody>
                        </table>
                        
                    </>}
                </div>
            </div>
            <div className='security-history'>
               <h3>{tab} Scan History</h3>
               <div className='scan-wrapper padding-history'>
               <table className='user_table table-margin' >
                <thead>
                    <tr>
                    <th>Scan ID</th>
                    <th>Time Stamp</th>
                    <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                     {
                      History && Object.entries(History).reverse().map(([key ,value])=>
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{value}</td>
                        <td><button className='security-primary history' onClick={()=>scanFunc('post','security-management/fetch-scan-network',key,setScanDetails)}>Get Details</button></td>
                      </tr>) 
                    } 
                </tbody>
            </table>
            </div>
            </div>
            </div>
        </>
        )
    }

    const ScanRouter=()=>{
        const [scanDetails,setScanDetails] = useState()
        const [deviceScanType,setDeviceScanType] = useState('file');
        
        return(
            <>
            <section className='securityManagement-tabs'>
            <button className={deviceScanType==='file'?'security-tab-active':'security-tab'} onClick={()=>setDeviceScanType('file')}>Device File Scan</button>
            <button className={deviceScanType==='Network'?'security-tab-active':'security-tab'} onClick={()=>setDeviceScanType('Network')}>Device Network Scan</button>
            </section>
            <div className='content-wrapper'>
            <div className='directory-result'>
                <h3 >Device {deviceScanType} Scan Results</h3> 
            </div>
            <div className='security-history'>
               <h3>Device {deviceScanType} Scan History</h3>
            </div>
            </div>
        </>
        )
    }

  return (
   <div>
    {showModal && <Modal showModal={showModal} handleModal={handleModal} type={type}/>}
    <NewHeader header_name="Security Management" path='securityManagement' />
    <div style={{margin:"1.5%"}}>
        <span style={{display:'flex',justifyContent:'flex-end',margin:"10px"}}>
            <button className='security-primary' onClick={()=>{
                setType('hash');
                handleModal();
            }}>Add Hash</button>
             <button className={`security-primary outline ${scanning && 'btn-disabled'}`} onClick={updateScanner} disabled={scanning}>{!scanning?"Update Scanner":"Scanning..."}</button>
        </span>
        <section className='securityManagement-tabs'>
            <button className={tab==='Directory'?'security-tab-active':'security-tab'} onClick={()=>setTab('Directory')}>Scan Directory</button>
            <button className={tab==='Network'?'security-tab-active':'security-tab'} onClick={()=>setTab('Network')}>Scan Network</button>
            <button className={tab==='Router'?'security-tab-active':'security-tab'} onClick={()=>setTab('Router')}>Scan Router</button>
        </section>
        <section className='tab-content'>
        {tab==='Directory' && <ScanDirectory/>}
        {tab==='Network' && <ScanNetwork/>}
        {tab==='Router' && <ScanRouter/>}
        </section>
    </div>
   </div>
  )
}

export default SecurityManagement