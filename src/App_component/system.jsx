import React, { Component } from 'react'
export default class SystemLog extends Component {

    constructor(props){
      super(props)
      this.state={
        systemlog:false,
        NR:false
      };
    }

    NR(){
      this.setState({systemlog:false})
      this.setState({NR:true})
    }

    SystemLog(){
      this.setState({NR:false})
      this.setState({systemlog:true})
    }

    Clear(){
      this.setState({NR:''})
      this.setState({systemlog:''})
    }
    

    render() {
        return (
          <>
            <div className="fullpage">
              
                <div className="rightpanel2">
                  <div className="onclickrightpannel2" onClick={() => this.SystemLog()}>System Logs</div>
                  <div className="onclickrightpannel2" onClick={() => this.NR()}>5G NR Logs</div>
                </div>
                <hr style={{ height: 2, marginTop: 3 }} />

                <div className='MainContent'>
                  {this.state.systemlog ? (
                    <div className="SystemLog">SytemLog</div>) : null}

                  {this.state.NR ? (
                    <div className="5GNR">5G NR</div>) : null}
                </div>

                <div className="Buttons" >
                  <div><button className='btn btn-primary' >Refresh</button></div>
                  <div><button className='btn btn-primary' >Download</button></div>
                  <div><button className='btn btn-outline-danger ' onClick={() => this.Clear()}>Clear</button></div>
                </div>
            </div>
          </>
        )
    }
}
