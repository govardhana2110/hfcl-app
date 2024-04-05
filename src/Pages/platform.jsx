import React from "react";
import DynamicMapper from "../Components/mapSchema";
import NewHeader from "../Components/header";
import NewLeftpanel from "../Components/leftPanel";
import backButton from "../Images/back.png";
import { cloneDeep } from "lodash";
import Loading from '../Components/loader';

class PlatformPanel extends React.Component{
    constructor(props){
        super(props);
        this.state={
          role:null,
            yangSchema: null,
            is_fetching: false,
          originalData: null,
          serverIP: process.env.REACT_APP_CLIENT_IP,
          device_id: null,
          mainContent: true,
          subHead: null,
          hold_alarms: null,
          get_alarms: null,
          showModuleContent: false,
          index: null,
          KeyYang: null,
          UniqueId: null,
          moduleContent: null,
         PlatformYangs:[
            [
                {'/platform/sys': 'ipi-system'},
                {'/platform/user': 'ipi-user-management'},
                {'/platform/usm': 'ipi-user-session-management'},
                {'/platform/elk': 'ipi-elk'},
                {'/platform/em': 'ipi-event-manager'},
                {'/platform/if-ext': 'ipi-if-extended'},
            ],
            [
                {'/platform/g8031': 'ipi-g8031'},
            ],
            [
                {'/platform/global-te': 'ipi-global-te'},
            ],
            [
                {'/platform/keychain': 'ipi-keychain'},
            ]
        ]
        };
    }
    componentDidMount(){
        let role_id=sessionStorage.getItem('role_id')
        this.setState({role:role_id});
        let id = sessionStorage.getItem("unique_id");
        this.setState({ uniqueId: id });
    }

    getRouterType(uniqueid) {
        const segments = uniqueid.split('-');
        const routerType = segments[segments.length - 1];
        return routerType;
    }

    async fetchSchema(key) {
        const {uniqueId}=this.state;
        const routerType = this.getRouterType(uniqueId);
        console.log(routerType,'type');
        const schemaModule = await import(`../${routerType}-schemas/${key}.json`);
        const schema = schemaModule.default;
        console.log(schema, "sche,a");
        this.setState({ yangSchema: schema });
    }
    
    fetchYangContent(key, name) {
      this.fetchSchema(name);
      this.setState({
        showModuleContent: true,
        is_fetching: true,
        getConfigYangData: null,
        KeyYang: key,
        moduleContent: null,
      });
      let device_unique_id = sessionStorage.getItem("unique_id");
      this.setState({ UniqueId: device_unique_id });
      if (key !== "/fault/watchdog") {
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
            console.log(resp)
            const originalData = JSON.parse(JSON.stringify(resp));
            this.setState({ getData: resp, getconfigmodule: resp, originalData });
            this.setState({ is_fetching: false });
            var data2 = this.updateDataWithMissingFields(
              this.state.yangSchema,
              resp,
              originalData
            );
            // var data3 = this.updateDataWithMissingFields(
            //   this.state.yangSchema,
            //   originalData
            // );
            console.log( "dat2oru",data2);
            this.setState({ originalData: data2['originalData'] });
            this.setState({ getConfigYangData: data2['fetchedData'] });
            if (resp.status && resp.status!=="Requested last saved state not present") {
              alert(resp.status);
              this.setState({ showModuleContent: false });
            }
          })
          .catch((err) => {
            if (err.response) {
              alert(err.response.data.status)
              console.log('Error Response Data:', err.response.data);
              console.log('Error Response Status:', err.response.status);
              console.log('Error Response Headers:', err.response.headers);
            }
          });  ;
      } else {
        this.setState({  is_fetching: false });
      }
    }

    updateDataWithMissingFields(schema, fetchedData, originalData) {
        let data = cloneDeep(fetchedData);
        let original = cloneDeep(originalData);
        function traverseSchema(schemaObj, dataObj, parentPath = "",isOriginalData = false) {
            const { properties, type, oneOf } = schemaObj;
            if (type !== "object" || !properties) {
                return;
            }
            // Check for missing keys in properties and add title from oneOf if applicable
            for (let key in dataObj) {
                const hasProperty = Object.prototype.hasOwnProperty.call(properties, key);
                if (!hasProperty && oneOf) {
                    for (let oneOfSet of oneOf) {
                        if (oneOfSet.properties && Object.prototype.hasOwnProperty.call(oneOfSet.properties, key)) {
                            dataObj.title = oneOfSet.title;
    
                            // Add properties from selected title to the main properties
                            if(isOriginalData){
                                const selectedProperties = oneOfSet.properties;
                                for (let propKey in selectedProperties) {
                                    properties[propKey] = selectedProperties[propKey];
                                }
                                break;
                            }
                            
                        }
                    }
                }
            }
    
            // Continue with traversing properties
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
        traverseSchema(schema, original ,true);
        return {
            originalData: original,
            fetchedData: data
        };
    }
    
      
    render(){
        return(
            <div style={{ height: "100vh", overflow: "hidden"}}>
    <div style={{ display: 'flex' }}>
        <NewLeftpanel page='platform' darkMode={this.state.isDarkMode} />
        <div style={{ flex: '4', marginLeft: "18%" }}>
            <NewHeader header_name='Platform Panel' path='Config' darkMode={this.state.isDarkMode} toggleDarkMode={this.toggleDarkMode} />
            {!this.state.showModuleContent && !this.state.mainContent ? (
                <div>
                    <div className="configurationMain">
                        {this.state.PlatformYangs[parseInt(this.state.index)].map(item => (
                            Object.keys(item).map(key => (
                                <div className='Ru_sub_button' onClick={() => this.fetchYangContent(key, item[key])}>
                                    <div className='notification_id' >
                                        <div className='notification_type_text'>{item[key].split("ipi-")}</div>
                                    </div>
                                </div>
                            ))
                        ))}
                    </div>
                    <div style={{ marginLeft: '21%', marginTop: '10px', zIndex: '1' }} onClick={() => this.setState({ mainContent: true, showModuleContent: false, is_fetching: false, subHead: null })}><img className="arrowplatform" src={backButton} alt="" width="30" /></div>
                </div>
            ) : null}
            {this.state.showModuleContent ? (
                <div>
                  <div className="backArrow"
            
            onClick={() =>
                this.setState({
                    showModuleContent: false,
                    is_fetching: false,
                })
            }
        >
            <img
                style={{
                    marginBottom: "6px",
                    cursor: "pointer",
                    position: "fixed",
                    marginTop:"-36px",
                    marginLeft:"13px",

                }}
                src={backButton}
                alt=""
                width="20"
            />
        </div>

                <div className='mainContent platformkeycontainer' style={{marginTop:"3%",
          height: "80vh",
        overflow: "auto",  
        width:"97%"}}>
                                            
                    <span>
                        {this.state.getConfigYangData ? (
                            <DynamicMapper
                                schema={this.state.yangSchema}
                                data={this.state.getConfigYangData}
                                originalData={this.state.originalData}
                                KeyYang={this.state.KeyYang}
                                role={this.state.role}
                            />
                        ) : null}
                    </span>
                </div>
                </div>
            ) : null}
            {this.state.mainContent ? (

                 
                <div className='mainContent' style={{ marginLeft: '-1%', marginTop: '3%', height: "80vh", overflow: "auto" }}>
                    <div style={{ display: 'flex',flexWrap:"wrap"}}>
                        <div style={{ display: 'flex', flexWrap:"wrap",justifyContent: 'center', flexDirection: 'column', alignItems: 'center', marginLeft: '50px' }}>
                            <div className='configBoxes' onClick={() => this.setState({ index: 0, mainContent: false, subHead: 'Management' })}>
                                <img alt="" className='configGear' src={require('../Images/management.png')}></img>
                            </div>
                            <div className='nameConfig'>Management</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', marginLeft: '50px' }}>
                            <div className='configBoxes' onClick={() => this.setState({ index: 1, mainContent: false, subHead: 'Carrier Ethernet' })}>
                                <img alt="" className='configGear' src={require('../Images/carrierethernet.png')}></img>
                            </div>
                            <div className='nameConfig'>Carrier Ethernet</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', marginLeft: '50px' }}>
                            <div className='configBoxes' onClick={() => this.setState({ index: 2, mainContent: false, subHead: 'Quality of Service' })}>
                                <img alt="" className='configGear' src={require('../Images/quality.png')}></img>
                            </div>
                            <div className='nameConfig'>Quality of Service</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', marginLeft: '50px' }}>
                            <div className='configBoxes' onClick={() => this.setState({ index: 3, mainContent: false, subHead: 'Security' })}>
                                <img alt="" className='configGear' src={require('../Images/shield.png')}></img>
                            </div>
                            <div className='nameConfig'>Security</div>
                        </div>
                    </div>
                </div>
            ) : null}
            {this.state.is_fetching === true ? (
                <Loading />
            ) : null}
        </div>
    </div>
</div>

           

        )

    }
}
export default PlatformPanel;