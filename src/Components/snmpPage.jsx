import React, { useState ,useEffect} from 'react';
import remove from "../Images/remove.png";
import add from "../Images/addNewTrigger.png";
import "../css/snmpPage.css";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import TextField from "@mui/material/TextField";

const SnmpComponent = ({onUpdateSnmpDetails }) => {
  const [ snmpDetails ,setSnmpDetails] = useState({ version: [], security_level: "", communityV1:[''], communityV2:[''], userName: "" , authKey: "", authProtocol:"", privKey:"", privProtocol: "" });
  const versionList = ["v1","v2","v3"];
  const securityLevelList=["noAuthNoPriv","authNoPriv","authPriv"];
  const authProtocolList = ["MD5", "SHA", "SHA224", "SHA256", "SHA384", "SHA512"];
  const privProtocolList = ["DES", "3DES", "AE5128", "AE5192", "AE5256"];

  useEffect(() => {
    onUpdateSnmpDetails(snmpDetails); 
  }, [snmpDetails, onUpdateSnmpDetails]);

  const handleVersionSelect = (e) => {
    const version = e.target.value;
    if(!(snmpDetails.version).includes(version) && e.target.checked){
      setSnmpDetails((prev) =>( {...prev , version: [...prev.version, version]}));
    }
    else if((snmpDetails.version).includes(version)){
      setSnmpDetails((prev) =>( {...prev , version: prev.version.filter((v) => v !== version) }));
    }
  };

  const renderInputFieldList = (index, name) => {  
    const community = name === 'communityV1' ? snmpDetails.communityV1 : snmpDetails.communityV2;
    return (
      <div key={index}>
        <TextField placeholder="abcdefg" type="text" id={name} label="Community Name*" variant="standard" value={community[index] || ''}
          onChange={(e) => handleCommunityChange(index, e.target.value, name)}
        />
      </div>
    );
  };

  const handleCommunityChange = (index, value, name) => {
    let tempArr = name === 'communityV1' ? [...snmpDetails.communityV1] : [...snmpDetails.communityV2];
    tempArr[index] = value;
    name === 'communityV1' ? setSnmpDetails((prev)=>({...prev,communityV1:[...tempArr]})) : setSnmpDetails((prev)=>({...prev,communityV2:[...tempArr]}));
  };

  const renderInputField = (label, fieldName) => {
    return (
      <div key={fieldName}>
        <TextField placeholder={label} type="text" id={label} label={label} variant="standard" value={snmpDetails[fieldName] || ''}
          onChange={(e) => handleInputChange(fieldName, e.target.value)} 
        />
      </div>
    );
  };

  const handleInputChange = (fieldName, value) => {
    setSnmpDetails(prevInput => ({ ...prevInput, [fieldName]: value }));
  };

  const addRemoveButton = (name, index) => {
    const community = name === 'communityV1' ? snmpDetails.communityV1 : snmpDetails.communityV2;
    return (
      <div key={index} style={{marginTop:"6%"}}>
        {community.length - 1 === index ? (
          <>
            {community.length - 1 ? (
              <img src={remove} alt=""  width={15} height={15}  className="add-Button" onClick={() => removeClick(index, name)} />
            ) : null}
            <img src={add} alt="" width={15} height={15} className="add-Button" onClick={() => handleAddClick(name)} />
          </>
        ): <img src={remove} alt=""  width={15} height={15} className="add-Button" onClick={() => removeClick(index, name)} />
        }
      </div>
    );
  };

  const handleAddClick = (name) => {
    name === 'communityV1' ? setSnmpDetails((prev)=>({...prev,communityV1:[...prev.communityV1, ""]})) : setSnmpDetails((prev)=>({...prev,communityV2:[...prev.communityV2, ""]}));
  };

  const removeClick = (index, name) => {
      let tempArr = [...snmpDetails[name]];
      tempArr.splice(index, 1);
      setSnmpDetails((prev)=>({...prev,[name]:[...tempArr]}))
  };

  const renderSelect = (label, options, value) => {
    return (
      <DropdownButton
        id={label} className='custom-dropdown snmpDropdown' title={snmpDetails[value] || label} drop="down"
        onSelect={(e) => setSnmpDetails(prev => ({...prev, [value]: e}))}
      >
        {options.map((option, optionIndex) => (
          <Dropdown.Item key={optionIndex} eventKey={option}>
              {option}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    );
  };

  return (
    <div style={{display:"flex", flexDirection:'column'}}>
      <div style={{display:"flex"}}>
        {versionList.map((version) => {
          return(
            <div className='snmpVersionlabels'>
              <input style={{width:"fit-content"}} type="checkbox" value={version} onChange={handleVersionSelect}  />
              <label style={{marginLeft:"5px"}}>{version}</label>
            </div>
          )      
        })}
      </div>
      <div style={{height:'210px',overflow:"auto", scrollbarWidth:"thin" ,padding: "0.22rem"}}>
        {snmpDetails.version && snmpDetails.version.map(version => {     
          switch (version) {
            case 'v1':
              return (
                <div className="version-Inputs" key={version}>
                  <label style={{fontWeight:"500"}}>Version 1</label>
                    {snmpDetails.communityV1.map((community, index) => (
                      <div style={{ display: "flex", marginLeft:"6%" }} >
                        {renderInputFieldList(index, "communityV1")}
                        {addRemoveButton("communityV1", index)}
                      </div>
                    ))}                
                </div>
              );
            case 'v2':
              return (
                <div className="version-Inputs" key={version}>
                  <label style={{fontWeight:"500"}}>Version 2</label>
                  {snmpDetails.communityV2.map((community, index) => (
                    <div style={{ display: "flex", marginLeft:"6%" }}>
                      <div key={index}>
                        {renderInputFieldList(index, "communityV2")}
                      </div>
                      {addRemoveButton("communityV2", index)}
                    </div>
                  ))}
                </div>
              );
            case 'v3':
              return (
                <div className="version-Inputs" key={version}>
                  <label style={{fontWeight:"500"}}>Version 3</label>
                  <div style={{marginleft:"6%"}}>
                    <div style={{ display: "flex"}}>
                      {renderSelect("Security Level", securityLevelList, "security_level")}
                      {renderInputField("UserName", "userName")}
                    </div>

                    { snmpDetails.security_level === 'authNoPriv' && (
                      <div style={{ display: "flex"}}>
                        {renderSelect("Auth Protocol",  authProtocolList, "authProtocol" )}
                        {snmpDetails.authProtocol && (
                          <div style={{marginLeft:"4px"}}>
                            {renderInputField("Auth Key", "authKey")}
                          </div>
                        )}
                      </div>
                    )}

                    {snmpDetails.security_level === 'authPriv' && (
                      <div>
                        <div style={{ display: "flex"}}>
                          {renderSelect("Auth Protocol",  authProtocolList, "authProtocol" )}
                            {snmpDetails.authProtocol && (
                              <div style={{marginLeft:"4px"}}>
                                {renderInputField("Auth Key", "authKey")}
                              </div>
                            )}
                        </div>
                        <div style={{ display: "flex"}}>
                          {renderSelect("Priv Protocol", privProtocolList, "privProtocol")}
                          {snmpDetails.privProtocol && (
                            <div style={{marginLeft:"4px"}}>
                              {renderInputField("Priv Key", "privKey")}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            default:
            return null;
          }
        })
        }
      </div>
    </div>
  );
};

export default SnmpComponent;
