import React, { Component } from "react";
import downArrow from '../Images/dropDown.png';
import upArrow from '../Images/arrow-up.png';
class DataMapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data['rw_data'].data,
      parentData: this.props.data,
      collapsed: {},
      serverIP: process.env.REACT_APP_CLIENT_IP,
    };
    this.postData = this.postData.bind(this);
  }

  handleCollapse(key) {
    const { collapsed } = this.state;
    this.setState({
      collapsed: {
        ...collapsed,
        [key]: !collapsed[key],
      },
    });
  }
  handleChange(path, key, updatedValue) {
    this.setState((prevState) => {
      const updatedData = { ...prevState.data };
      const keys = path.split('.');
      let currentData = updatedData;
  
      for (let i = 0; i < keys.length; i++) {
        const currentKey = keys[i];
        if (!currentData[currentKey]) {
          currentData[currentKey] = {}; // Create the nested object if it doesn't exist
        }
        if (i === keys.length - 1) {
          // If it's the last key in the path, update it
          currentData[currentKey] = updatedValue;
        }
        currentData = currentData[currentKey];
      }
  
      // Log the updated data for debugging
      console.log('Updated Data:', updatedData);
  
      return { data: updatedData };
    });
  }
  
  renderProperty(key, value, path = "") {
    const isCollapsed = this.state.collapsed[key];
    
    if (value && typeof value === "object") {
      return (
        <div key={key}>
          <div onClick={() => this.handleCollapse(key)} style={{fontSize:"15px",fontWeight:"500",textTransform:"capitalize"}}>
            <span>
              {isCollapsed ? (
                <img alt="" src={upArrow} width={10} />
              ) : (
                <img alt="" src={downArrow} width={10} />
              )}
            </span>
            {key}
          </div>
          {!isCollapsed && (
            <div style={{ marginLeft: "20px" }}>
            {Object.entries(value).map(([subKey, subValue]) => (
              this.renderProperty(subKey, subValue, path ? path + "." + key : key)
            ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div key={key} style={{margin:"2px"}}> 
          <div style={{color:"rgb(57 75 102)"}}> 
            {key} :{" "}
            <input
            className="tableInput"
              style={{fontSize:"14px"}}
              type="text"
              value={value}
              onChange={(e) => this.handleChange(path + "." + key, key, e.target.value)}
            />
          </div>
        </div>
      );
    }
  }
  postData() {
    var dict = {
      "template_id": this.state.parentData._id,
      "template_name": this.state.parentData.template_name,
      "rw_data": {
        "data" : this.state.data
      },
    };
    fetch(`http://${this.state.serverIP}:5000/configuration-management/edit-config-as-template`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'username': sessionStorage.getItem('username'),
        'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
      },
      body: JSON.stringify(dict),
    })
      .then(resp => resp.json())
      .then(resp => {
        alert(resp.status);
        console.log(this.state.data)
      })
      .catch((err) => {
        if (err.response) {
          alert(err.response.data.status)
          console.log('Error Response Data:', err.response.data);
          console.log('Error Response Status:', err.response.status);
          console.log('Error Response Headers:', err.response.headers);
        }
      });  ;
  }
  render() {
      const { data } = this.state;
      console.log(this.state.data)
    return (
      <div>
        <div style={{
        }}>
          {Object.entries(data).map(([key, value]) =>
            this.renderProperty(key, value)
          )}
        </div>
        <div  onClick={()=>{this.postData();this.props.closeViewTemplatePopUp()}}  className="btn btn-primary mb-3 applyChangesTemplate" 
        >
          Apply Changes
        </div>
      </div>
    );
  }
}

export default DataMapper;
