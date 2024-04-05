/**
 * This page is a component page which have InputModule component in it.
 * We can call this component any where in our application by just importing this component.
 * 
 * Developer's worked on the below code-
 * @SaketSagar
 * @AdityaTripathi
 */
import React from "react";
class LeafInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      //  formValues: [{ name: "a" },{name:'b'}],
       //formValues: {},
      formValues:this.props.formValues,
      type:this.props.type,
      lable:this.props.lable,
      readonly:this.props.readonly,
     };
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  
  handleChange(i, e) {
    let formValues = this.props.formValues;
    formValues[i] = e.target.value;
    this.setState({ formValues });
  }

  addFormFields(i) {
    let formValues = this.props.formValues;
    formValues.push(i);
    this.setState({ formValues });
  }

  removeFormFields(i) {
    let formValues = this.props.formValues;
    formValues.splice(i, 1);
    this.setState({ formValues });
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log('hjsaxbsahvxsahbxs')
    // alert(JSON.stringify(this.state.formValues));
  }

  render() {

    return (
      <div>
        {this.state.readonly?(
        <div className="form-inline" style={{display:'flex'}}>
            <label style={{marginRight:'90px'}}>{this.state.lable}</label>
            {this.props.formValues.map((element, index) => (
            <div  key={index} style={{display:'flex',marginBottom:'3px'}}>
              <input className="input_list_underline_ro" type={this.state.type}  defaultValue={element}  />
            </div>
           ))}
        </div>
        ):(
          <form  onSubmit={this.handleSubmit}>
            <div className="form-inline" style={{display:'flex'}}> 
              <div className="button-section">
              <label style={{marginRight:'90px'}}>{this.state.lable}</label>
            <span onClick={() => this.addFormFields()}className='create_container'><button className='button_icon_plus'>&#10011;</button></span>
          </div>
              {this.props.formValues.map((element, index) => (
              <div  key={index} style={{display:'flex'}}>
                <span className="deleteicon">
                <input className="input_list_underline_rw" type={this.state.type}  defaultValue={element || ""} onChange={e => this.handleChange(index, e)} 
                />
                <span>
                {
                  index ? 
                  <div className="cancel_cross" onClick={() => this.removeFormFields(index)}>&#10006;</div>
                  : null
                }
                </span>
                </span>
              </div>
               ))}
            </div>
         
          
        </form>
        )}

                
      </div>
    );
  }
}
export default LeafInput;