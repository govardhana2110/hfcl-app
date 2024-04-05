import React from 'react';
import downArrow from '../Images/dropDown.png';
import upArrow from '../Images/arrow-up.png';
import Up from '../Images/up-arrow.png';
import Down from '../Images/down-arrow.png';
import jsPDF from 'jspdf';
import "jspdf-autotable";
import Loading from '../Components/loader';

class CheckboxComponent extends React.Component {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
    this.state = {
      schema : props.schema,
      serverIP:process.env.REACT_APP_CLIENT_IP,
      matchedElementRefs: [],
      currentHighlightedIndex: -1,
      searchQuery: '',
      matchedPaths: [],
      checkedItems: {},
      nestedJson: {},
      expanded: this.initializeExpandedState(props.schema?props.schema.properties:{}),
      checkedDevices: this.props.deviceList,
      selectedKey: this.props.selectedKey,
      isGenerating:false,
      currentScrollIndex: 0,
      currentResultIndex:0,
    };
  }

  handleSearch = (query) => {
    const matchedPaths = this.searchInSchema(this.props.schema.properties, query);
    const matchedElementRefs = matchedPaths.map((path) => this.containerRef.current.querySelector(`[data-path="${path}"]`))
    this.setState({
      searchQuery: query,
      matchedPaths,
      matchedElementRefs,
      currentScrollIndex: 0,
      currentHighlightedIndex: -1, // Reset the highlighted index when searching
      currentResultIndex: query ? this.state.currentResultIndex : 0
    });
  };

  scrollToNextOccurrence = () => {
    const { currentHighlightedIndex, matchedElementRefs, currentResultIndex } = this.state;
    const nextIndex = (currentHighlightedIndex + 1) % matchedElementRefs.length;
    
    if (matchedElementRefs[nextIndex]) {
      matchedElementRefs[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.setState({
        currentHighlightedIndex: nextIndex,
        currentResultIndex: nextIndex + 1,
      });
    } else {
      this.setState({ currentHighlightedIndex: -1, currentResultIndex: 0 });
    }
  };
  
  scrollToPrevOccurrence = () => {
    const { currentHighlightedIndex, matchedElementRefs, currentResultIndex } = this.state;
    const prevIndex = (currentHighlightedIndex - 1 + matchedElementRefs.length) % matchedElementRefs.length;
  
    if (prevIndex === 0 || !matchedElementRefs[prevIndex]) {
      this.setState({ currentHighlightedIndex: -1, currentResultIndex: 0 });
    } else {
      matchedElementRefs[prevIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.setState({
        currentHighlightedIndex: prevIndex,
        currentResultIndex: prevIndex + 1,
      });
    }
  };
  
  initializeExpandedState = (properties) => {
    const expandedState = {};

    const setExpandedState = (schema, path = []) => {
      JSON.stringify(schema)!=='{}' && schema!== undefined && Object.entries(schema).forEach(([key, value]) => {  
        const currentPath = [...path, key];

        if (value.type === 'object' && value.properties) {
          expandedState[currentPath.join('.')] = true;
          setExpandedState(value.properties, currentPath);
        } else if (value.type === 'array' && value.items && value.items.type === 'object') {
          expandedState[currentPath.join('.')] = true;
          setExpandedState(value.items.properties, currentPath);
        }
      });
    };
    setExpandedState(properties);
    
    return expandedState
  };
  
  searchInSchema = (schema, query, path = []) => {
    const matches = [];

    Object.entries(schema).forEach(([key, value]) => {
        const currentPath = [...path, key];

        if (key.toLowerCase().startsWith(query.toLowerCase())) {
            matches.push(currentPath.join('.'));
        }

        if (value.type === 'object' && value.properties) {
            matches.push(...this.searchInSchema(value.properties, query, currentPath));
    
        } else if (value.type === 'array' && value.items && value.items.type === 'object') {
            matches.push(...this.searchInSchema(value.items.properties, query, currentPath));
        }
    });

    return matches;
  };

  handleChange = (event, path) => {
    const { name, checked } = event.target;
    this.setState((prevState) => {
      const { checkedItems, nestedJson } = prevState;
      const updatedCheckedItems = {
        ...checkedItems,
        [path.join('.')]: checked,
      };
      let updatedNestedJson = nestedJson;
      let currentLevel = updatedNestedJson;
      path.forEach((key) => {
        if (!currentLevel[key]) {
          currentLevel[key] = {};
        }
        currentLevel = currentLevel[key];
      });
  
      if (checked) {
        currentLevel = {};
      } else {
        delete currentLevel[name];
      }
      return {
        checkedItems: updatedCheckedItems,
        nestedJson: updatedNestedJson,
      };
    });
  };
  
  handleSave = () => {
    const { nestedJson } = this.state;
    var temp = {}
    temp['data'] = nestedJson
    temp['devices'] = this.props.deviceList
    temp['key'] = this.props.selectedKey.split("/configuration/")[1] 
    if(temp['devices'].length>0 && Object.keys(temp['data']).length>0){
      this.setState({isGenerating:true})
      fetch(`http://${this.state.serverIP}:5000/configuration-management/filter-config-data`,
        {
            mode: 'cors',
            method: 'POST',
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'Content-Type': 'application/json',
                'username': sessionStorage.getItem('username'),
              },
            body:JSON.stringify(temp)
        })
        .then(resp => resp.json())
        .then(resp =>{ 
          this.setState({filterConfigData:resp,isGenerating:false}) 
        this.exportPDF(resp)
      })
    }
    else if(Object.keys(temp['data']).length<1){
      alert('Please choose parameters to compare first')
    }
    else{
      alert('Please Select Devices First')
    }
    
  };

  exportPDF = (resp) => {
    var currentTime = new Date().toLocaleString().replace(/:/g, '-');
    var data = [];
    let respArr = Object.keys(resp).map(key => {
        const deviceObject = resp[key];
        return {
            uniqueId: key,
            ...deviceObject
        };
    });

    const isObject = resp instanceof Object && !Array.isArray(resp);

    // Extract unique properties from resp excluding "status"
    const allProperties = new Set();
    if (isObject) {
        Object.keys(resp).forEach(key => {
            Object.keys(resp[key]).forEach(property => {
                if (property !== "status") {
                    allProperties.add(property);
                }
            });
        });
    } else { // Assuming resp is an array
        resp.forEach(entry => {
            Object.keys(entry).forEach(key => {
                if (key !== "status") {
                    allProperties.add(key);
                }
            });
        });
    }

    // Convert Set to array for further processing
    const parameters = Array.from(allProperties);
    if (!parameters.includes("unique-id")) {
        parameters.unshift("unique-id"); // Add "unique-id" only if not present
    }

    if (isObject) {
        data = Object.values(resp);
    } else { // Assuming resp is an array
        data = resp;
    }

    const maxColumnsPerTable = 4;
    const columnWidths = Array.from({ length: maxColumnsPerTable }, () => 80); // Adjust column widths as needed
    const unit = "pt";
    const size = "A4";
    const orientation = "portrait";
    const doc = new jsPDF(orientation, unit, size);
    doc.setFontSize(12);

    for (let i = 0; i < parameters.length; i += maxColumnsPerTable) {
        // Doc column headers
        const columns = parameters.slice(i, i + maxColumnsPerTable);
        if (!columns.includes("unique-id")) {
            columns.unshift("unique-id"); // Add "unique-id" only if not present
        }
        const tableData = [columns];

        for (let i of respArr) {
            delete i?.status
            if (Object.keys(i).length > 1) {
                let arr = [];
                for (let j of columns) {
                    if (j === 'unique-id') j = 'uniqueId';
                    if (j === "ipi-bfd:bfd/global/config/notification-enabled") {
                        i[j] === true ? arr.push(true) : arr.push(false);
                        continue;
                    }
                    let value = i[j]
                    arr.push(value!==null?value:true)
                    
                }
                tableData.push(arr)
                arr = []
            }
        }
        doc.autoTable({
            head: [tableData[0]],
            body: tableData.slice(1),
            columns: columnWidths,
            margin: { top: 60 },
        });

        if (i + maxColumnsPerTable < parameters.length) {
            doc.addPage();
        }
    }

    doc.save(`Compare configuration report ${currentTime}.pdf`);
};



  toggleExpand = (path) => {
    this.setState((prevState) => {
      const { expanded } = prevState;

      const currentPath = path.join('.');
      const updatedExpanded = { ...expanded };
      updatedExpanded[currentPath] = !expanded[currentPath];

      return { expanded: updatedExpanded };
    });
  };

  isExpanded = (path) => {
    const { expanded } = this.state;

    const currentPath = path.join('.');
    return expanded[currentPath];
  };

  renderCheckboxes = (schema, path = []) => {
    const { checkedItems, matchedPaths, searchQuery,expanded } = this.state;
  
    return JSON.stringify(schema)!=='{}' &&  Object.entries(schema.properties ).map(([key, value],index) => {
      const { type,enum: enumValues } = value;
      const checkboxName = key;
      const currentPath = [...path, key];
      const isMatched = searchQuery && matchedPaths.includes(currentPath.join('.'));

  
      if (type === 'string' || type === 'number' || type === 'boolean' || type === 'null' || (type === "array" && value.items.type==="null") || enumValues ){
        const dataPath = currentPath.join('.');
  
        return (
          <div key={key} className={`checkbox ${isMatched ? 'matched' : ''}`} style={{ marginLeft: '5px' }}>
            <label
              style={{ display: 'flex' }}
              htmlFor="checkbox1"
              className='checkboxes'
              data-path={currentPath.join('.')}
              id={`result-${index}`}    
            >
              <input
                type="checkbox" 
                className='checkboxes'
                name={checkboxName}
                checked={checkedItems[dataPath] || false}
                onChange={(event) => this.handleChange(event, currentPath)}
              />
              <div style={{ marginLeft: '1%', marginTop: '0.5%' }}>{key}</div>
            </label>
          </div>
        );
      }

      if (type === 'object') {
        return (
          <div >
            <div  className="headerNet" onClick={() => this.toggleExpand(currentPath)}>
              <img
                src={this.isExpanded(currentPath) ? upArrow : downArrow}
                alt={this.isExpanded(currentPath) ? 'Collapse' : 'Expand'}
                className="arrow-icon"
                width={10}
              />
              <label data-path={currentPath.join('.')} id={`result-${index}`} key={key} className={`object ${isMatched ? 'matched' : ''}`} style={{marginLeft:'1%'}}>{key}</label>
            </div>
            {this.isExpanded(currentPath) && (
              <div  className="nested">{this.renderCheckboxes(value, currentPath)}</div>
            )}
          </div>
        );
      }

      if (type === 'array' && value.items.type === 'object') {
        return (
          <div >
            <div className="headerNet" onClick={() => this.toggleExpand(currentPath)}>
              <img
                src={this.isExpanded(currentPath) ? upArrow : downArrow}
                alt={this.isExpanded(currentPath) ? 'Collapse' : 'Expand'}
                className="arrow-icon"
                width={10}
              />
              <label  data-path={currentPath.join('.')} id={`result-${index}`} key={key} className={`array ${isMatched ? 'matched' : ''}`} style={{marginLeft:'1%'}}>{key}</label>
            </div>
            {this.isExpanded(currentPath) && (
              <div className="nested">{this.renderCheckboxes(value.items, currentPath)}</div>
            )}
          </div>
        );
      }

      return null;
    });
  };

  componentDidUpdate(prevProps) {
    if (prevProps.schema !== this.props.schema) {
      this.setState({
        expanded: this.initializeExpandedState(this.props.schema ? this.props.schema.properties : {}),
      });
    }
  }

  render() {
    const { schema } = this.props;
    return (
      <div className="checkbox-container"  ref={this.containerRef}>
        <div  class="searchFields">
          <div style={{display: "flex"}}>
              <input
                  type="search"
                  class="form-control rounded"
                  placeholder="Search"
                  aria-label="Search"
                  aria-describedby="search-addon"
                  onChange={(e) => {
                    this.handleSearch(e.target.value);
                    e.preventDefault();
                  }}
              />
            <img src={Up} style={{cursor:"pointer"}} width={20} height={20} onClick={this.scrollToPrevOccurrence}></img>
            <img src={Down} style={{cursor:"pointer"}}width={20} height={20} onClick={this.scrollToNextOccurrence}></img>
          </div>
          <p style={{fontSize:"smaller",marginLeft:"72%"}}>
            {this.state.matchedElementRefs.length > 0 && this.state.searchQuery !== '' ? (
              `${this.state.currentResultIndex}/${this.state.matchedElementRefs.length}`
            ) : null}
          </p>
        </div>

        

        {this.renderCheckboxes(schema ? schema : {})}

        <button
          style={{ position: 'fixed', right: '1%', bottom: '10%' }}
          className="cancelRole" onClick={this.handleSave}>
          Generate Report
        </button>

        {this.state.isGenerating ? (
          <Loading />
        ) : null}
      </div>
    );
  }
  
}

export default CheckboxComponent;