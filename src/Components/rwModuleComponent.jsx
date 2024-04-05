import React from 'react';
import info from '../Images/info.png';

class RWmodule extends React.Component{
    constructor(props){
        super(props);
        this.state={
            get_data:this.props.get_data,
            key_name:this.props.key_name,
            index:this.props.Index,
            value:this.props.value,
            type: this.props.type,
            label:this.props.label,
            place_holder:this.props.place_holder, 
            label_align:this.props.label_align, 
            mandatory:this.props.mandatory,
            error_field:null,
            readOnly:this.props.readOnly,
            description:this.props.description,
            options:this.props.options,
            leafList:this.props.leafList,
            leafListType:this.props.leafListType,
            details:this.props.details,
            disabledInputs:false,
        };
        // this.handleChange=this.handleChange.bind(this);
    }
    handleChange(e){
      var max=this.state.details['maximum']
      var min=this.state.details['minimum']
      var maxLength=this.state.details['maxLength']
      var minLength=this.state.details['minLength']
        var value=e.target.value
        var temp=this.props.get_data
        var key_name=this.props.key_name
        var pattern = new RegExp(this.state.details.pattern);
        if(value){
            if(this.state.index){
                temp[this.state.index][key_name] = e.target.value;
                this.setState({value:e.target.value})
            }
            else{
                temp[key_name] = e.target.value;
                this.setState({value:e.target.value})
            }
            this.setState({error_field:null})
            if ((value < min ||value > max) && this.props.type==='number') {
              this.setState({ error_field: `Range should be between ${min} and ${max}` });
            }
            if(this.props.type==='string' && this.state.details.pattern){
              var convertedPattern = this.convertPattern(pattern.source);
              var isMatched = convertedPattern.test(value);
              if(value.length > maxLength){
                this.setState({ error_field: `Range should be between ${minLength} and ${maxLength}` });
              }
              if (!isMatched) {
                this.setState({ error_field: 'invalid  pattern: ' + this.state.details.pattern });
              } else {
                this.setState({ error_field: null });
              }
            }
            if(this.props.type==="anyOf"){
              var pattern1 = new RegExp(this.state.details.anyOf[0].pattern);
              var pattern2 = new RegExp(this.state.details.anyOf[1].pattern);
              var convertedPattern1 = this.convertPattern(pattern1.source);
              var convertedPattern2 = this.convertPattern(pattern2.source);
              var isMatched1 = convertedPattern1.test(value);
              var isMatched2 = convertedPattern2.test(value);
              if ((isMatched1 || isMatched2)===false) {
                this.setState({ error_field: 'Ininvalid pattern: '});
              }
            }
            if(this.state.details.path){
              var split=this.state.details.path.split("/")
              var pathValue=temp[split[1]][split[2]]
              if(pathValue){
                temp[key_name] =pathValue;
                this.setState({value:pathValue,error_field:'value should be same as' + this.state.details.path})
              }
              else{
                this.setState({error_field:'value should be same as' + this.state.details.path})
              }
              
            }
        }
        else{
            if(this.state.mandatory===true){
                this.setState({error_field:'*required',value:''})
            }
            else{
              temp[key_name] = ''; 
                this.setState({error_field:null,value:''})
            }
        }
         this.setState({get_data:temp})
    }
     convertPattern(pattern) {
      pattern = pattern.replace(/^\/|\/$/g, '');
      pattern = '^' + pattern + '$';
      var convertedPattern = new RegExp(pattern);
      return convertedPattern;
    }
    booleanHandle = (e, key) => {
      const temp = this.props.get_data;  
      const value = e.target.value === 'true';
      temp[key] = value;
      this.setState({value });
    };
    handleCheck(e, key) {
      var temp =this.props.get_data ; 
      var value = e.target.checked ? [null] : [];
      temp[key] = value; 
      this.setState({ value, get_data: temp })
    }
    handleChangeLeaf(i, e) {
      let value = this.props.value;
      value[i] = e.target.value;
      this.setState({ value });
    }
  
    addFormFields(i) {
      let value = this.props.value;
      value.push(i);
      this.setState({ value });
    }
  
    removeFormFields(i) {
      let value = this.props.value;
      value.splice(i, 1);
      this.setState({ value });
    }
  
    handleSubmit(event) {
      event.preventDefault();
      // alert(JSON.stringify(this.state.value));
    }
    componentDidMount(){
      const disabledInputs=sessionStorage.getItem("disableInputs")
      this.setState({disabledInputs})
    }
   
    render() {
      const {disabledInputs,value}=this.state;
        return (
          <div>
            {this.state.readOnly === true ? (
              <div className="input_field_flex">
                <div className="label-container">
                  <label htmlFor="my-label">{this.state.label}</label>
                  <div className="info-button">
                    <img alt="" src={info} width={9} />
                  </div>
                  <span id="my-label" className="label-description">
                    {this.state.description}
                  </span>
                </div>
                <div className="input_shift">
                  <input
                    className="readonly_input"
                    type={this.state.type}
                    readOnly
                    value={this.state.value}
                  />
                </div>
              </div>
            ) : (
              <div className="input_field_flex">
                <div className="label-container">
                  <label htmlFor="my-label">{this.state.label}<span>{this.state.mandatory===true?<h style={{color:'red',fontSize:'large',fontWeight:'bold'}}>*</h>:null}</span></label>
                  <div className="info-button"><img alt="" src={info} width={9} /></div>
                  <span id="my-label" className="label-description">
                    {this.state.description}
                  </span>
                </div>
                <div className="input_shift">
                  {this.state.type === 'enum' ? (
                    <select
                      className="inputDropdown"
                      value={this.state.value}
                      onChange={(e) => this.handleChange(e,'1')}
                    >
                      <option value={this.state.value}>{this.state.value}</option>
                      {this.state.options.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : this.state.type === 'array' && this.state.leafList===false ? (
                    <div>
                        {this.state.value}
                          <input
                          disabled={disabledInputs}
                          style={{width:'3%'}}
                            type="checkbox"
                            checked={this.state.value && this.state.value[0] === null} // Check if the value is an array with a single null element
                            value={this.state.value}
                            onChange={(e) => this.handleCheck(e, this.state.key_name)}
                            
                          />
                    </div>
                  ) :  this.state.type === 'boolean' ? (
                    <select value={value===""?false:value} onChange={(e) => this.booleanHandle(e, this.state.key_name)}>
                        <option value={true}>true</option>
                        <option value={false}>false</option>
                    </select>
                  ):
                  (
                    this.state.leafList!==false?(
                      this.state.readOnly?(
                        <div className="form-inline">
                            {this.props.value.map((element, index) => (
                            <div  key={index} style={{marginBottom:'3px'}}>
                              <input className="input_list_underline_ro" type={this.state.type}  defaultValue={element}  />
                            </div>
                           ))}
                        </div>
                        ):(
                          <form  onSubmit={this.handleSubmit}>
                            <div className="form-inline"> 
                              {this.props.value.map((element, index) => (
                              <div  key={index}>
                                <span className="deleteicon" style={{display:'flex'}}>
                                <input
                                 disabled={disabledInputs}
                                 className="input_list_underline_rw" type={this.state.type}  defaultValue={element || ""} onChange={(e) => this.handleChangeLeaf(index, e)} 
                                />
                                <span>
                                {
                                  index ? 
                                  <div className="cancel_cross" style={{cursor:'pointer',marginLeft:'10px'}} onClick={() => this.removeFormFields(index)}>&#10006;</div>
                                  : null
                                }
                                </span>
                                </span>
                              </div>
                               ))}
                               <div className="button-section">
                            <span onClick={() => this.addFormFields()}className='create_container'><button className='button_icon_plus'>&#10011;</button></span>
                            </div>
                            </div>
                        </form>
                        )
                    ):(
                      <input
                      disabled={disabledInputs}
                      type={this.state.type}
                      value={this.state.value}
                      onChange={(e) => {
                      this.handleChange(e,'2')
                      }}
                    />
                    )
                  )}
                  <p className="alert_message">{this.state.error_field}</p>
                </div>
                
              </div>
            )}
          </div>
        );
      }
      
      
}
export default RWmodule;