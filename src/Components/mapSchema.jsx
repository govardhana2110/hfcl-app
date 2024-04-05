import React, { Component } from "react";
import downArrow from '../Images/dropDown.png';
import upArrow from '../Images/arrow-up.png';
import dashImage from '../Images/dash.png';
import RWmodule from "./rwModuleComponent";
import Loading from "./loader";
import list from '../Images/list.png';
import leaf from '../Images/leaf.png';
import leafReadOnly from '../Images/leafReadOnly.png';
import listReadOnly from '../Images/listReadOnly.png';
import { cloneDeep } from "lodash";

class DynamicMapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOptionalType:null,selectedOptions: {},
      highlightedData:null,keyPressed:false,
      collapsed: {},selectedPath:null,searchTerm:'',
      formData: {},      elementsToScroll: [],
      data:this.props.data,storeValue:null,storeData:null,
      KeyYang:this.props.KeyYang,collapse:false,
      originalData:this.props.originalData,
      showFieldsCallId: 0,
      serverIP: process.env.REACT_APP_CLIENT_IP,
      selectedNode: null, 
      valueList:[],
      highlight:{
        color: "#b7b723",
      fontWeight: "600"},
      highlightsearch:{
        background: "yellow",
        },
      Index:null,
      isPushing:false,collapsedNodes:[],
      lastSavedState:false,
    };
    this.latestShowFieldsCallId = 0;
    this.handleCollapse = this.handleCollapse.bind(this);
    this.showFields = this.showFields.bind(this);
    this.handleNodeClick = this.handleNodeClick.bind(this); 
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.highlightedElementRef = React.createRef();
  }

  handleCollapse(path,key,where) {
   // console.log(where)
    path = path.substring(1);
    const { collapsed } = this.state;
    if(path===""){
      this.setState({
        collapsed: {
          ...collapsed,
          [key]: !collapsed[key],
        },
      });
    }
    else{
      this.setState({
        collapsed: {
          ...collapsed,
          [`${path}.${key}`]: !collapsed[`${path}.${key}`],
        },
      });
    }
  }
  
  isCollapsed(path, index = null) {
    path = path.substring(1);
    const { collapsed } = this.state;
    if (index !== null) {
      path = `${path}[${index}]`;
    }
    if(path[0]==='.'){
      return collapsed[path.substring(1)] || false;
    }
    else{
      return collapsed[path] || false;
    }
  }

  handleLogTypeChange = (selectedOptionalType, property, data, path) => {
    this.setState({ storeValue: null });
    this.setState({ selectedOptionalType });
    const updatedSelectedOptions = { ...this.state.selectedOptions };
    updatedSelectedOptions[path] = selectedOptionalType;
    
    this.setState({ selectedOptions: updatedSelectedOptions });
    const optionalSet = property['oneOf'] ? property['oneOf'] : [];
    
    for (let i = 0; i < optionalSet.length; i++) {
      if (optionalSet[i].title === selectedOptionalType) {
        property.properties = { ...property.properties, ...optionalSet[i].properties };
      } else {
        for (let key in property.properties) {
          for (let key1 in optionalSet[i].properties) {
            if (key === key1) {
              delete property.properties[key1];
            }
          }
        }
      }
    }
  
    setTimeout(() => {
      const a = this.updateDataWithMissingFields(this.props.schema, this.state.data);
      const b = this.updateDataWithMissingFields(this.props.schema, this.state.data);
      this.setState({ data: a ,originalData:b});
    }, 1);
  };

  renderProperty(key, property, value,initialData, path = "",) {
    const isCollapsed = this.isCollapsed(`${path}.${key}`);
    const { highlightedData, searchTerm, keyPressed } = this.state;
    const optionalSet= property['oneOf']? property['oneOf']:null;
    const selectedOption = this.state.selectedOptions[path] || "";
    let scrolledToFirstMatch = false;

    const highlightedKey =
      highlightedData && highlightedData[key] !== undefined ? highlightedData[key] : key;

    const isHighlightedKey =
      (key.toLowerCase().includes(searchTerm) || searchTerm.includes(key.toLowerCase())) &&
      keyPressed;

    const scrollToHighlightedKey = (element) => {
      if (element && !scrolledToFirstMatch) {
        scrolledToFirstMatch = true;
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    if (property.type === 'object') {
      function hasObjectKeys(properties) {
          for (const key in properties) {
            if(properties[key].items){
              if (properties[key].type === 'object' || properties[key].items.type === 'object') {
                return true;
              }
              }
              else{
                if (properties[key].type === 'object') {
                  return true;
                }
            }
          }
          return false;
        }
      return (
        <div
        key={key}
        className="dynamicKey"
        style={this.state.selectedPath === path + '.' + key ? this.state.highlight : null}
        ref={isHighlightedKey ? scrollToHighlightedKey : null}
      >
          {property.oneOf && !property.readOnly ? (
            <select
              className='log-type-select'
              value={selectedOption}
              onChange={(e) =>
                this.handleLogTypeChange(e.target.value, property, this.state.data, path)
              }
              style={{ fontSize: 'x-small', borderRadius: '2px',height:'31px' }}
            >
              <option value="" disabled style={{fontSize:'small'}}>Select an Option</option> {/* Placeholder option */}
              {optionalSet.map((option, optionIndex) => (
                <option style={{fontSize:'small'}} key={optionIndex} value={option.title}>
                  {option.title}
                </option>
              ))}
            </select>
          ) : null}

          <div
            onClick={(e) => {
              this.showFields(value, property, this.state.data, path + "." + key, key);
              this.handleCollapse(path,key,'1');
            }}
          >
            <span onClick={() => this.handleCollapse(path, key, '2')}>
            {hasObjectKeys(property.properties) ? ( // Check if there are object type keys
              isCollapsed ? (
                <img
                  alt=""
                  src={upArrow}
                  width={10}
                  style={{
                    marginBottom: "4px",
                    marginTop: "5px",
                    marginRight: "5px",
                  }}
                />
              ) : (
                <img
                  alt=""
                  src={downArrow}
                  width={10}
                  style={{
                    marginBottom: "4px",
                    marginTop: "5px",
                    marginRight: "5px",
                  }}
                />
              )
            ) : (
              <img
                alt=""
                src={dashImage} // Use your dash.png image here
                width={10}
                style={{
                  marginBottom: "4px",
                  marginTop: "5px",
                  marginRight: "5px",
                }}
              />
            )}
            <img src={property.readOnly === true ? leafReadOnly : leaf} width={15} style={{ marginRight: '8px' }} alt="" />
          </span>
            <span style={isHighlightedKey ? this.state.highlightsearch : null}>
              {highlightedKey}
              
            </span>
          </div>
          {!isCollapsed && (
            <div>
              {Object.entries(property.properties).map(([subKey, subProperty]) =>
                this.renderProperty(subKey, subProperty, value[subKey],initialData[subKey], path + "." + key)
              )}
            </div>
          )}
        </div>
      );
    } else if (property.type === "array" && property.items.type === "object") {
      return (
        <div key={key} style={{ marginLeft: "20px" }} className="dynamicKey">
          <div
            style={this.state.selectedPath === path + '.' + key ? this.state.highlight : null}
            onClick={(e) => {
             // console.log(this.state.selectedPath)
              this.showFields(value, property, this.state.data, path + "." + key, key);
              this.handleCollapse(path,key,'3');
            }}
          >
            {property.items.type !== "null" && (
              <span onClick={() => this.handleCollapse(path,key,'4')}>
                {isCollapsed ? (
                  <img
                    alt=""
                    src={upArrow}
                    width={10}
                    style={{
                      marginBottom: "4px",
                      marginTop: "5px",
                      marginRight: "5px",
                    }}
                  />
                ) : (
                  <img
                    alt=""
                    src={downArrow}
                    width={10}
                    style={{
                      marginBottom: "4px",
                      marginTop: "5px",
                      marginRight: "5px",
                    }}
                  />
                )}
              <img src={property.readOnly===true?listReadOnly:list} width={15} style={{marginRight:'8px'}} alt=""/>
              </span>
            )}
            {key}
            
            {property.items.type === "null" ? null : (
              <span
                style={{ marginLeft: "8px", fontSize: "large" }}
                onClick={(e) => {
                  this.addNewSet(property, key, value,initialData);
                  e.stopPropagation();
                }}
              >
                +
              </span>
            )}
          </div>
          {!isCollapsed && (
            <div style={{ marginLeft: "10px" }}>
              {Array.isArray(value) && value.length > 0 && property.items.type !== "null" ? (
                value.map((item, index) => {
                  const isSetCollapsed = this.isCollapsed(`${path}.${key}`, index);
                  return (
                    <div key={index}>
                      <div
                      style={this.state.selectedPath === path + '.' +`${key}[${index}]` ? this.state.highlight : null}
                       onClick={(e) => {              
                           // console.log(this.state.selectedPath,path + '.' + key)
                            this.handleCollapse(path, key + "[" + index + "]",'5');
                            this.showFields(
                              value[index],
                              property.items,
                              this.state.data,
                              path + "." + key + "[" + index + "]",
                              key,
                              index
                            );
                          }}>
                        <span>
                          {isSetCollapsed ? (
                            <img
                              alt=""
                              src={upArrow}
                              width={10}
                              style={{
                                marginBottom: "4px",
                                marginTop: "5px",
                                marginRight: "5px",
                              }}
                            />
                          ) : (
                            <img
                              src={downArrow}
                              alt=""
                              width={10}
                              style={{
                                marginBottom: "4px",
                                marginTop: "5px",
                                marginRight: "5px",
                              }}
                            />
                          )}
                        </span>

                        {index}/ <h style={{ fontWeight: "10px" }}>{property.items['keyFields'][0]}:  {value[index][property.items['keyFields'][0]]}</h>
                        {property.items.type === "null" ? null : (
                          <span
                            style={{ marginLeft: "8px", fontSize: "15px" ,color:'#a90808ba',fontWeight:'700' }}
                            onClick={() => this.removeSet(value, index, property.items.keyFields)}
                          >
                            x
                          </span>
                        )}
                      </div>
                     
                      {!isSetCollapsed && (
                        <div>
                          {Object.entries(property.items.properties).map(([subKey, subProperty]) =>
                            this.renderProperty(
                              subKey,
                              subProperty,
                              value[index][subKey],
                              initialData[index][subKey],
                              path + "." + key + "[" + index + "]"
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div>
                  {Object.entries(property.items.properties).map(([subKey, subProperty]) =>
                    this.renderProperty(subKey, subProperty, value,initialData, path + "." + key)
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
  }
  
  
  createEmptyItem(property) {
    if (property.type === "object") {
      const newItem = {};
      Object.keys(property.properties).forEach((key) => {
        newItem[key] = this.createEmptyItem(property.properties[key]);
      });
      return newItem;
    } else if (property.type === "array") {
      return [this.createEmptyItem(property.items)];
    } else {
      return "";
    }
  }

  addNewSet(property, key,value,initialData) {
    let newData = { ...this.state.data };
    if(value.length>1){
      if(!this.isNestedDataSetEmpty(value[value.length-1])){
        var emptySet=this.createEmptyItem(property.items)
        if(value[0]===emptySet){
         // console.log(true,'kyabe')
        }
        value.push(this.createEmptyItem(property.items))
        initialData.push(this.createEmptyItem(property.items))
      }
      else{
        alert('Fill this set first')
      }
    }
    else{
      if(!this.isNestedDataSetEmpty(value)){
         emptySet=this.createEmptyItem(property.items)
        if(value[0]===emptySet){
         // console.log(true,'kyabe')
        }
        value.push(this.createEmptyItem(property.items))
        initialData.push(this.createEmptyItem(property.items))
      }
      else{
        alert('Set is empty')
      }
    }
    // newData[key] = value;
    this.setState({ data: newData });
  }

   isNestedDataSetEmpty(dataSet) {
    // Base case: check if dataSet is empty or an empty array
    if (dataSet === "" || (Array.isArray(dataSet) && dataSet.length === 0)) {
      return true;
    }
  
    // Check if dataSet is an object
    if (typeof dataSet === "object") {
      // Iterate over the object keys
      for (let key in dataSet) {
        // Recursively call isNestedDataSetEmpty for each value in the object
        if (!this.isNestedDataSetEmpty(dataSet[key])) {
          return false;
        }
      }
      return true;
    }
  
    return false; // If the value is not empty or an object, return false
  }
  
  removeSet(value,index,keyFields){
    let newData = { ...this.state.data };
    const checkIfEmpty=this.isNestedDataSetEmpty(value[index])
    //console.log(checkIfEmpty,'empty')
    if(!checkIfEmpty){
      value[index]["@nc:operation"]="delete"
      this.setState({ data: newData }, () => {
       // console.log(this.state.data);
        this.postData();
        value.splice(index,1);
      });
    }
    else{
      value.splice(index,1);
      this.setState({ data: newData }, () => {
      //  console.log(this.state.data);
      });
    }
  }
  addXMNLS(item) {
    function traverse(obj) {
      for (const key in obj) {
        if(typeof parseInt(key) === 'number'){
          //console.log(key,obj)
          for (let i = 0; i < obj.length; i++) {
            for (let key in obj[i]) {
              if (typeof obj[i][key] === 'string' || JSON.stringify(obj[i][key]).includes('@nc:operation') ){
                if (obj[i].config && key in obj[i].config) {
                  obj[i][key] = obj[i].config[key];
                }
              }
            }
          }
        }
        if (key.includes(':') && typeof obj[key] === 'object') {
          const xmlnsKey = key.split(':')[0]
          obj[key][`@xmlns:${xmlnsKey}`] = `http://www.ipinfusion.com/yang/ocnos/${xmlnsKey}`;
        }
        if (typeof obj[key] === 'object') {
          traverse(obj[key]); // Recursively traverse child objects
        }
      }
    }
    try{
    const newItem = JSON.parse(JSON.stringify(item));
    traverse(newItem);
    return(newItem)
    }catch(err){
      alert(err)
    }
  }
    // adding mandatory key value pairs in modified data from fieldschema
  updateMandatory(originalData, schema) {
      function update(obj, schemaObj) {
          if (schemaObj.properties) {
              for (const prop in schemaObj.properties) {
                  const propSchema = schemaObj.properties[prop];
                  if (propSchema.mandatory !== undefined) {
                      obj[prop] = {
                          value: obj[prop],
                          mandatory: propSchema.mandatory
                      };
                  }
                  update(obj[prop], propSchema);
              }
          } else if (schemaObj.items && schemaObj.items.properties) {
              for (let i = 0; i < obj.length; i++) {
                  for (const prop in schemaObj.items.properties) {
                      const propSchema = schemaObj.items.properties[prop];
                      if (propSchema.mandatory !== undefined) {
                          obj[i][prop] = {
                              value: obj[i][prop],
                              mandatory: propSchema.mandatory
                          };
                      }
                      update(obj[i][prop], propSchema);
                  }
              }
          }
      }
  
      const updatedData = JSON.parse(JSON.stringify(originalData)); // Deep copy
      for (const key in schema.properties) {
          if (updatedData[key]) {
              update(updatedData[key], schema.properties[key]);
          }
      }
  
      return updatedData;
  }

  // extracting changed data along with mandatory fields
  updateData(data, originalUpdatedData) {
    function update(obj, schemaObj) {
        for (const prop in schemaObj) {
            if (schemaObj[prop].mandatory && !obj[prop]) {
                obj[prop] = schemaObj[prop].value;
            }
            if (typeof obj[prop] === 'object' && typeof schemaObj[prop] === 'object') {
                update(obj[prop], schemaObj[prop]);
            }
            if(prop === 'username' && obj.hasOwnProperty("config")){
              obj[prop] = obj.config.username
            }
        }
    }

    let updatedData = JSON.parse(JSON.stringify(data)); // Deep copy
    update(updatedData, originalUpdatedData);

    return updatedData;
  }
  
  postData() {
    this.setState({isPushing:true})
    const {data,originalData} =this.state;
    console.log(originalData,"original")
    console.log(data,"mod")
    const postData=this.getChangedData(originalData,data,this.props.schema);
   // postdata with madatory fields
    const updatedPostData = postData !== undefined && this.updateData(postData,this.updateMandatory(data,this.props.schema))
    console.log(this.updateMandatory(data,this.props.schema))
    console.log(updatedPostData,"updated")
    //updated changes in yand module
    const addDeleteTag=this.replaceEmptyStrings(updatedPostData);
    const addXMNLS = this.addXMNLS(addDeleteTag) 
    var configBody=JSON.stringify(addXMNLS);
    let device_unique_id = sessionStorage.getItem("unique_id");
    fetch(`http://${this.state.serverIP}:5000/configuration-management${this.state.KeyYang}/${device_unique_id}`, {
          mode: 'cors',
          method: 'POST',
          headers: {
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Content-Type': 'application/json',
            'username': sessionStorage.getItem('username'),
          },
          body: configBody
        })
      .then(resp => resp.json())
      .then(resp => {
        this.setState({ postResponse: resp,isPushing:false });
        // console.log(resp, 'post response');
        if(resp.status){
          if(resp.status.message){alert(resp.status.message)}
          else if(
            resp.status['rpc-reply']){alert('Success')
            this.fetchApi(this.state.KeyYang)
          }
          else{alert('Error ')}
        }
      })
      .catch((err) => {
        if (err.response) {
          console.log(err)
          alert(err.response.data.status)
          // console.log('Error Response Data:', err.response.data);
          // console.log('Error Response Status:', err.response.status);
          // console.log('Error Response Headers:', err.response.headers);
        }
      }); 
  }

  
  replaceEmptyStrings = (data) => {
    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        return data.map((item) => this.replaceEmptyStrings(item));
      } 
      else {
        const result = {};
        if(data){
          Object.keys(data).forEach((key) => {
            const value = data[key];
            if (value === '' && JSON.stringify(value)!=='[]' && JSON.stringify(value)!=='[null]') {
              result[key] = {"@nc:operation":"delete"};
            }
            else if(Array.isArray(value) && value.length===0){
              result[key] = {"@nc:operation":"delete"};
            }
            else {
              result[key] = this.replaceEmptyStrings(value);
            }
          });
          return result;
        }
      }
    } else {
      return data;
    }
  
  };
   removeEmptyKeys = (obj) => {
    try{Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value === null || value === "" || (Array.isArray(value) && this.isEmptyArray(value))) {
        delete obj[key];
      } else if (typeof value === "object" && Object.keys(value).length > 0) {
        this.removeEmptyKeys(value);
        if (this.isEmptyObject(value)) {
          delete obj[key];
        }
      }
    })}catch(err){
     // console.log(err)
    };
  };
  
   isEmptyArray = (arr) => {
    return arr.every((item) => item === null || item === "" || (Array.isArray(item) && this.isEmptyArray(item)));
  };
  
   isEmptyObject = (obj) => {
    return Object.keys(obj).length === 0;
  };

  getChangedData = (original, modified, fieldSchema) => {
    let containerChanged = false; // Flag to track changes within the container
    if ((original === null && modified === null) || (typeof original !== 'object' && typeof modified !== 'object')) {
      return original === modified ? undefined : modified;
     
    }
  
    if ( (original === undefined && typeof modified === 'object') ||(typeof original === 'object' && modified === undefined)) {
      console.log(original)
      const originalIsEmpty = Object.keys(original || {}).length === 0;
      const modifiedIsEmpty = Object.keys(modified || {}).length === 0;
      if (originalIsEmpty && modifiedIsEmpty) {
        return undefined;
      }
      return originalIsEmpty || modifiedIsEmpty ? modified : original;
    }
  
    if (Array.isArray(original) && Array.isArray(modified) && fieldSchema &&  fieldSchema.items) {
      if (JSON.stringify(original) !== JSON.stringify(modified) && typeof modified[0] === 'string' && modified.every(item => typeof item === 'string')) {
        console.log(modified===original,modified,original)
        return modified;
      }
      const changedItems = [];
      modified.forEach((item, index) => {
        const change = this.getChangedData(original[index], item, fieldSchema.items);
        if (change !== undefined) {
        const changedItem = {};
        if (fieldSchema.items.keyFields) {
        fieldSchema.items.keyFields.forEach(keyField => {
        changedItem[keyField] = item[keyField];
        // Object.keys(item).map(key => {
        //   if (fieldSchema.items.properties[key].type === 'object' && key !== 'state') {
        //     changedItem[key] = {};
        //     for(let keyConfig in item[key]){
        //       if(fieldSchema.items.keyFields.includes(keyConfig) && fieldSchema.items.keyFields.length>1){
        //         change[key][keyConfig] = item[key][keyConfig];
        //       }
        //     }
        //   }
        // })
        });
        }
          Object.assign(changedItem, change);         
        changedItems.push(changedItem);
        containerChanged = true; 
        } 
        else if (original.length === 0 && modified.length === 1 && modified[0] === null && fieldSchema.items && fieldSchema.type === 'array' && fieldSchema.items.type === 'null') {
        changedItems.push(modified[0]);
        }
      });
  
      if (!containerChanged && original.length === modified.length) {
        return undefined;
      }
      return changedItems;
    }
  
    const changedData = {};
    for (const key in modified) {
      const change = this.getChangedData(
        original ? original[key] : undefined,
        modified ? modified[key] : undefined,
        fieldSchema && fieldSchema.properties ? fieldSchema.properties[key] : undefined
      );
      if (change !== undefined) {
        console.log(key)

        changedData[key] = change;
        containerChanged = true; // Set the flag to indicate changes in the container
      } else if (
        fieldSchema &&
      fieldSchema.properties &&
      fieldSchema.properties[key] &&
      fieldSchema.properties[key].mandatory==="true" &&
      !fieldSchema.properties[key].properties
      ) {
      // Keep key-value pair for mandatory fields without child nodes
      changedData[key] = modified[key];
      }
    }
    return containerChanged ? changedData : undefined;
  };

  handleChange(event) {
    this.setState({
      searchTerm: event.target.value.toLowerCase(),
      keyPressed:false
    });
  }
  
  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.setState({ keyPressed: true });
      const searchTerm = this.state.searchTerm;
      const nestedData = this.state.data;
  
      // Perform the search and highlight
      const { highlightedData, highlightedElement } = this.highlightSearchResult(nestedData, searchTerm);
  
      this.setState({
        highlightedData,
        highlightedElement
      });
  
      // Scroll to the first occurrence of the highlighted element
      // if (highlightedElement) {
      //   highlightedElement.scrollIntoView({
      //     behavior: 'smooth',
      //     block: 'center'
      //   });
      // }
    }
  }
  
  highlightSearchResult(data, searchTerm) {
    let highlightedData = [];
    let highlightedElement = null;
  
    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        // Handle array data
        highlightedData = data.map((item) => {
          const { highlightedData: itemHighlightedData, highlightedElement: itemHighlightedElement } = this.highlightSearchResult(item, searchTerm);
          if (itemHighlightedElement && !highlightedElement) {
            highlightedElement = itemHighlightedElement;
          }
          return itemHighlightedData;
        });
      } else {
        // Handle object data
        highlightedData = Object.keys(data).map((key) => {
          const highlightedValue = this.highlightSearchResult(data[key], searchTerm);
          if (key.toLowerCase().includes(searchTerm) && !highlightedElement) {
            highlightedElement = document.getElementById(key);
          }
          return (
            <div key={key}>
              <span>{key}: </span>
              {highlightedValue}
            </div>
          );
        });
      }
    } else if (typeof data === 'string') {
      // Handle string data
      if (data.toLowerCase().includes(searchTerm)) {
        highlightedData = <mark>{data}</mark>;
      }
    }
  
    return { highlightedData, highlightedElement };
  }

  handleNodeClick(key) {
   // console.log(key)
    const { selectedNode } = this.state;
    if (selectedNode === key) {
      this.setState({ selectedNode: null }); 
    } else {
      this.setState({ selectedNode: key }); 
    }
  }
  showFields = (value, property,data,path,key,index) => {
    this.setState({selectedPath:path})
    const parentData = this.getParentData(data, path);
   // console.log(parentData)
    new Promise((resolve) => {
      this.setState({storeValue: null}, resolve);
    })
    .then(() => {
      if(index){this.setState({Index:index})}
      const dict = {'details':{}};
      if (value) {
        if(property.type==='array'){
          for (const key in value) {
            dict['details'][key]='Explain'
          }
        }
        
        else{
          for (const key in value) {
            if (typeof value[key] !== "object" || value[key]==[] ) {
              dict[key] = value[key];
              dict['details'][key]=property.properties[key]
            }
            if(property.properties[key]){
              if(typeof value[key] === "object" && property.properties[key]['maxItems']===1 && property.properties[key]['items']['type']==='null'){
                dict[key] = value[key];
                dict['details'][key]=property.properties[key]
              }
              if(typeof value[key] === "object"  && property.properties[key]['type']==='array' && property.properties[key]['items']['type']!==('object'||'null')){
                dict[key] = value[key];
                dict['details'][key]=property.properties[key]
              }
            }
          }
        }
      } else {
        let position = null;
        if (property.type === "array") {
          position = property.items.properties;
        } else {
          position = property.properties;
         // console.log('jj');
        }
    
        for (const key in position) {
          const currentNode = position[key];
          if ("type" in currentNode || "enum" in currentNode) {
            if (currentNode.type !== "array" && currentNode.type !== "object") {
              dict[key] = "";
            }
          }
        }
      }
     // console.log(dict,'storevalue')
      this.setState({ storeValue: dict ,selectedNode:null,storeData:parentData[this.state.lastKey]});
    });
  };

  getParentData(data, path) {
    const keys = path.split(".").filter((key) => key !== "");
      const newKeys = [];

      for (let i = 0; i < keys.length; i++) {
        if (keys[i].includes("[")) {
          const [contentOutsideBrackets, contentInsideBrackets] = keys[i].split("[");
          newKeys.push(contentOutsideBrackets, parseInt(contentInsideBrackets.slice(0, -1)));
        } else {
          newKeys.push(keys[i]);
        }
      }
      this.setState({lastKey:newKeys[newKeys.length-1]})
    let parentData = data;
    for (let i = 0; i < newKeys.length - 1; i++) {
      const key = newKeys[i];
     // console.log(parentData[key])
      parentData = parentData[key];
    }
    for (let i = 0; i < parentData.length; i++) {
      for (let key in parentData[i]) {
        if (typeof parentData[i][key] === 'string') {
          if (key in parentData[i].config) {
            parentData[i][key] = parentData[i].config[key];
          }
        }
      }
    }
   // console.log(parentData)
    return parentData;
  }
  renderFields = (data) => {
    const { role } = this.props;
  
    return (
      <div style={{ marginTop: "5px" }}>
        {Object.keys(data).map((key) => {
          if (key !== 'details' && data['details'][key]) {
            const fieldDetails = data['details'][key];
            const fieldType = fieldDetails['type'];
            const fieldItems = fieldDetails['items'];
            const fieldOneOf = fieldItems && fieldItems['oneOf'];
           // console.log(fieldOneOf)
            const isLeafList =
              fieldType === 'array' && fieldOneOf && fieldOneOf.length > 1;
            const leafListTypes = isLeafList
              ? fieldOneOf.map((item) => item.type)
              : null;
            return (
              <RWmodule
                key={key}
                label={key}
                type={
                  'enum' in fieldDetails
                    ? 'enum'
                    : fieldOneOf
                    ? 'anyOf'
                    : fieldType
                }
                details={fieldDetails}
                mandatory={fieldDetails['mandatory']}
                description={fieldDetails['description']}
                key_name={key}
                options={fieldDetails['enum'] || null}
                value={data[key]}
                readOnly={
                  role === 'NETWORK-OPERATOR' || fieldDetails['readOnly']
                }
                get_data={this.state.storeData}
                leafList={fieldDetails['items']?(fieldDetails['items']['type']==='string' ? true : false ):false}
                leafListType={
                  isLeafList
                    ? leafListTypes.filter((type) => type !== 'null')
                    : null
                }

              />
            );
          }
          return null;
        })}
        {this.state.isPushing ? <Loading /> : null}
      </div>
    );
  };
  
  
  componentDidMount(){
    const { data } = this.state;
    this.setState({})
    if(data['last-saved_state']){
      this.setState({lastSavedState:true})
    }
  }
  fetchApi(key){
    //console.log(key,'key')
    let device_unique_id = sessionStorage.getItem("unique_id");
    fetch(
      `http://${this.state.serverIP}:5000/configuration-management${key}/${device_unique_id}`,
      {
        mode: "cors",
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token
        },
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        const originalData = JSON.parse(JSON.stringify(resp));
       // console.log(resp, "yangadata");
        var data2 = this.updateDataWithMissingFields(
          this.props.schema,
          resp
        );
        var data3 = this.updateDataWithMissingFields(
          this.props.schema,
          originalData
        );
        this.setState({ originalData: data3 });
        this.setState({ data: data2 });
      })
      .catch((err) => {
        if (err.response) {
          alert(err.response.data.status)
          // console.log('Error Response Data:', err.response.data);
          // console.log('Error Response Status:', err.response.status);
          // console.log('Error Response Headers:', err.response.headers);
        }
      });  ;
  }
  updateDataWithMissingFields(schema, fetchedData) {
   // console.log('called',schema)
    let data = cloneDeep(fetchedData);
    function traverseSchema(schemaObj, dataObj, parentPath = "") {
      const { properties, type } = schemaObj;
      if (type !== "object" || !properties) {
        return;
      }

      Object.entries(properties).forEach(([key, value]) => {
        const fullPath = parentPath ? `${parentPath}.${key}` : key;
        const hasData = Object.prototype.hasOwnProperty.call(dataObj, key);

        if (!hasData) {
          if (value.type === "object") {
            dataObj[key] = {};
            traverseSchema(value, dataObj[key], fullPath);
          } else if (value.type === "array") {
            dataObj[key] = [];
            // Add empty object with required keys in the array
            const itemSchema = value.items;
            const newItem = {};
            traverseSchema(itemSchema, newItem);
            if (value["items"].type === "object") {
              dataObj[key].push(newItem);
            }
          } else {
            dataObj[key] = "";
          }
        } else if (value.type === "object") {
          traverseSchema(value, dataObj[key], fullPath);
        } else if (value.type === "array" && Array.isArray(dataObj[key])) {
          const arrayData = dataObj[key];
          arrayData.forEach((item, index) => {
            if (typeof item === "object") {
              traverseSchema(value.items, item, `${fullPath}[${index}]`);
            }
          });
        }
      });
    }

    traverseSchema(schema, data);
    return data;
  } 
  collapseAll(bool) {
    const { originalData } = this.state;
    function flattenObject(obj) {
      const result = {};
    
      function recurse(current, path) {
        if (typeof current === 'object' && !Array.isArray(current)) {
          for (const key in current) {
            const newPath =  path ? `${path}.${key}` : key;
            recurse(current[key], newPath);
            result[newPath] = bool ? false : true;
          }
        } else if (Array.isArray(current)) {
          current.forEach((item, index) => {
            const newPath = `${path}[${index}]`;
            recurse(item, newPath);
            result[newPath] = bool ? false : true;
            // Add a dynamic key for the array element
            result[`${path}_${index}`] = bool ? false : true;
          });
        }
      }
    
      recurse(obj, '');
    
      return result;
    }
     
    
    const flattenedData = flattenObject(originalData);
    this.setState({ collapsed: flattenedData }, () => {
     // console.log(this.state.collapsed);
    });
    if(bool){
      this.setState({collapse:false})
    }
    else{
      this.setState({collapse:true})
    }
  }
  
  render() {
    const { schema } = this.props;
    const { data, storeValue ,originalData} = this.state;
    const properties = schema.properties;     
    return (
      <div style={{ display: "flex" }}>
        {this.state.data ? (
          <div className='yangTreeKey' style={{height:"77vh",overflow:"auto"}}>
          <div style={{width: '32%',height: '31px',position: 'fixed'}}>
          <div onClick={()=>this.collapseAll(this.state.collapse)} className="collapseAll">{!this.state.collapse?('Collapse All'):('Expand All')}</div>
            <div className='tabbox' style={{marginLeft:'14.55%',width:'18%',position:'fixed'}}>
              <img alt="" className='tabicon' src={require('../Images/search.png')}></img>
              <input
                placeholder='Search'
                style={{ border: '0', height: '90%', width: '272px' }}
                value={this.state.searchTerm}
                onChange={(e) => this.handleChange(e)}
                onKeyPress={this.handleKeyPress}
              />
            </div>
          </div>
            {Object.keys(properties).map((key) => {
              const property = properties[key];
              const value = data && data[key] ? data[key] : null;
              const initialData = originalData && originalData[key] ? originalData[key] : null;
              return (
                <div className="yangkeys">
                  {this.renderProperty(key, property, value,initialData)}
                </div>
              );
            })}
          </div>
        ) : null}
        <div  className='yangTreeValue'>
        {this.state.lastSavedState?(
          <div style={{fontSize:'small',color:'#d91a1a'}}>*Device is not connected, this is the last saved config state.</div>
        ):null}
        {storeValue ?(
          <div>
            <div className='selectedPath'>{this.state.selectedPath}</div>
            <div style={{paddingTop:'36px'}}>{this.renderFields(storeValue)}</div>
          </div>
        ) :null}
        </div>
        <button className="applyButton fonts" onClick={() => this.postData()}>APPLY</button>
      </div>
    );
  }
    
}
export default DynamicMapper;