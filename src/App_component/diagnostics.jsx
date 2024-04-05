import React, { Component } from 'react'

export default class Diagnostics extends Component {

  constructor(props){
    super(props)
    this.state={
      Report:false,
    };
}

  ViewReport(){
  this.setState({Report:!this.state.Report})}

    render() {
        return (
        
          <>
            <div className="fullpage">
              
                <div className="Diagnostics">
                  <div className="HeaderInformation">
                    <div className='itemSize'>Information</div>
                    <div className='itemSize'>Status</div>
                    <div className='itemSize'>Test</div>
                    <div className='itemSize'>Action</div>
                  </div>
                  <div className="I2C">
                    <div className='EachParametersRow' id="FirstSection">
                      <div className='itemSize' id="radio">
                        <div  ><input type="radio" className="form-check-input" name="radio" /></div>
                        <div style={{ marginLeft: 'px' }}>I2C</div>
                      </div>
                      <div className='itemSize'>Pass</div>
                      <div className='itemSize'>Run</div>
                      <div className='itemSize'>-</div>
                    </div>
                    <div className='EachParametersRow' id="FirstSection">
                      <div className='itemSize' id="radio">
                        <div style={{ marginLeft: '20px' }}><input type="radio" className="form-check-input" name="radio" /></div>
                        <div>I2C0</div>
                      </div>
                      <div className='itemSize'>Pass</div>
                      <div className='itemSize'>Run</div>
                      <div className='itemSize'>-</div>
                    </div>
                    <div className='EachParametersRow' id="FirstSection">
                      <div className='itemSize' id="radio">

                        <div style={{ marginLeft: '20px' }}><input type="radio" className="form-check-input" name="radio" /></div>
                        <div>I2C1</div>
                      </div>
                      <div className='itemSize'>Pass</div>
                      <div className='itemSize'>Run</div>
                      <div className='itemSize'>-</div>
                    </div> </div>
                  <div className='EachParametersRow'>
                    <div className='itemSize' id="radio">
                      <div><input type="radio" className="form-check-input" name="radio" /></div>
                      <div>SPI</div>
                    </div>
                    <div className='itemSize'>Failed</div>
                    <div className='itemSize'>Run</div>
                    <div className='itemSize' id="ViewReport" onClick={() => this.ViewReport()}>View report</div>
                  </div>

                  {this.state.Report ? (
                    <div className="report" >Fault Cause</div>) : null}

                  <div className='EachParametersRow'>
                    <div className='itemSize' id="radio">
                      <div><input type="radio" className="form-check-input" name="radio" /></div>
                      <div>AXI</div>
                    </div>
                    <div className='itemSize'>Pass</div>
                    <div className='itemSize'>Run</div>
                    <div className='itemSize'>-</div>
                  </div>
                  <div className='EachParametersRow'>
                    <div className='itemSize' id="radio">
                      <div><input type="radio" className="form-check-input" name="radio" /></div>
                      <div>GPS</div>
                    </div>
                    <div className='itemSize'>N/A</div>
                    <div className='itemSize'>Run</div>
                    <div className='itemSize'>-</div>
                  </div>
                  <div className='EachParametersRow'>
                    <div className='itemSize' id="radio" >
                      <div><input type="radio" className="form-check-input" name="radio" /></div>
                      <div>DDR</div>
                    </div>
                    <div className='itemSize'>N/A</div>
                    <div className='itemSize'>Run</div>
                    <div className='itemSize'>-</div>
                  </div>
                </div>
            </div>
          </>
        )
    }
}
