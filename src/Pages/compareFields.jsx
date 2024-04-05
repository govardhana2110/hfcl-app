import React from 'react';
import Select from "react-dropdown-select";
import { cloneDeep } from "lodash";
import CheckboxComponent from '../Components/dynamicMap';

const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '30px',
    height: '30px',
    width: '200px',
    borderRadius: '4px',
    border: state.isFocused ? '1px solid #007bff' : '1px solid #ced4da',
    boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0,123,255,.25)' : 'none',
    backgroundColor: state.selectProps.menuIsOpen ? '#f8f9fa' : '#fff',
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: '14px',
    padding: '8px',
  }),
  menu: (provided, state) => ({
    ...provided,
    zIndex: 9999,
    borderRadius: '4px',
    boxShadow: '0 0 4px rgba(0,0,0,.3)',
  }),
  placeholder: (provided, state) => ({
    ...provided,
    fontSize: '14px',
    color: '#6c757d',
  }),
};

class CompareFields extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serverIP: process.env.REACT_APP_CLIENT_IP,
      supportedYAangs: [
        { key: '/configuration/net-inst', value: 'ipi-network-instance' },
        { key: '/configuration/interface', value: 'ipi-interface' },
        { key: '/fault/bfd', value: 'ipi-bfd' },
        { key: "/configuration/isis", value: "ipi-isis" },
        { key: "/configuration/aaa", value: "ipi-aaa"},
        { key: "/configuration/arp", value: "ipi-arp" },
        { key: "/fault/vrrp", value: "ipi-vrrp"  },
        { key: "/configuration/bgp", value: "ipi-bgp" },
        { key: "/configuration/serv-map", value: "ipi-service-map" },
        { key:  "/configuration/m-serv", value: "ipi-management-server" },
        // Add more options here
      ],
      isLoading: false,
      content: null,
      selectedKey: '',
    };
  }

  
  handleDropdownChange = (selected) => {
    const { supportedYAangs } = this.state;
    const selectedOption = selected[0];
    const selectedKey = supportedYAangs.find((option) => option.value === selectedOption.value)?.key || '';
    this.setState({ selectedOption, selectedKey });
  };
 
  handleLoadModule = () => {
    const { selectedOption, selectedKey} = this.state;
    console.log(selectedKey,'selectedKey')
    if (selectedOption) {
      this.setState({ isLoading: true });
      this.fetchYangContent(selectedKey, selectedOption.value);
      setTimeout(() => {
        const fetchedContent = `Content for ${selectedOption.value}`;
        this.setState({ isLoading: false, content: fetchedContent });
      }, 2000);
    }
  };
  async fetchSchema(key) {
    const schemaModule = await import(`../csar-schemas/${key}.json`);
    const schema = schemaModule.default;
    console.log(schema, "sche,a");
    this.setState({ yangSchema: schema });
  }

  fetchYangContent(key, name) {
    this.fetchSchema(name);
    
  }
  updateDataWithMissingFields(schema, fetchedData) {
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
  render() {
    const { supportedYAangs, selectedOption, isLoading, content } = this.state;

    return (
      <div className='page'>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ marginRight: '10px' }}>Select an option:</span>
          <Select
            options={supportedYAangs.map((option) => ({ value: option.value, label: option.value }))}
            values={selectedOption ? [selectedOption] : []}
            onChange={this.handleDropdownChange}
            styles={selectStyles}
            placeholder='Select an option'
          />
          <button onClick={this.handleLoadModule} disabled={!selectedOption || isLoading} className='load-module'>
            Load Module
          </button>
        </div>

        {isLoading && <div>Loading...</div>}
        {content && 
        <div>{content} 
              <CheckboxComponent schema={this.state.yangSchema} />
        </div>}
      </div>
    );
  }
}

export default CompareFields;
