import React, { Component } from "react";
import RU5G001 from './RU5G001.jpg'

export default class FirmwareUpgrade extends Component {
  constructor(props) {
    super(props);
    this.state = {
      PopUpShow: false,
      PopUpHide: true,
      ipadd: "",
      username: "",
      password: "",
      filepath: "",
    };
  }

  PopUpShow() {
    this.setState({ PopUpShow: true });
  }

  PopUpHide() {
    this.setState({ PopUpShow: false });
  }

  // Dialog Input States set Values

  Username = (event) => {
    this.setState({ username: event.target.value });
  };

  Password = (event) => {
    this.setState({ password: event.target.value });
  };

  IpAdd = (event) => {
    this.setState({ ipadd: event.target.value });
  };

  FilePath = (event) => {
    this.setState({ filepath: event.target.value });
  };

  render() {
    return (
      <>
        <div className="fullpage">
          <div className="FirmwareUpgrade d-flex">
            {this.state.PopUpShow ? (
              <div className="PopUpShow">
                <div id="MyModal">
                  <div className="modal-content">
                    <div className="pop">
                      <div style={{ fontWeight: "bold" }}>
                        Please login to continue{" "}
                      </div>
                      <div className="info">
                        <input
                          id="username"
                          type="text"
                          required="required"
                          placeholder="Username"
                          value={this.state.username}
                          onChange={this.Username}
                        />

                        <input
                          id="password"
                          type="password"
                          required="required"
                          placeholder="Password"
                          value={this.state.password}
                          onChange={this.Password}
                        />

                        <input
                          id="ipadd"
                          type="text"
                          required="required"
                          placeholder="IP Address"
                          value={this.state.ipadd}
                          onChange={this.IpAdd}
                        />

                        <input
                          id="ipadd"
                          type="text"
                          required="required"
                          placeholder="File Path"
                          value={this.state.filepath}
                          onChange={this.FilePath}
                        />

                        <div className="login">
                          <button
                            class="btn btn-primary"
                            id="Login"
                            onClick={() => this.PopUpHide()}
                          >
                            Login
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>{" "}
              </div>
            ) : null}

            <div className="RU5G001">
              <img alt="" src={RU5G001} alt="" />
              <div>RU5G001</div>
            </div>
            <div className="ComponentsDetails d-flex">
              <div className="Components">
                Current Firmware Version
                <div className="VersionValue">1.03.68</div>
              </div>
              <div className="Components">
                New Firmware Version
                <div className="VersionValue">1.03.80</div>
              </div>
              <div className="Components">
                Last Upgrade
                <div className="VersionValue">20th Feb 2021</div>
              </div>
            </div>
          </div>
          <div className="DialogBox">
            <div className="RadioBtn">
              <div className="SFTP" style={{ width: "140px" }}>
                <input
                  type="radio"
                  name="radio"
                  className="form-check-input"
                  required="required"
                  placeholder="Required"
                />
                SFTP
              </div>
              <div className="Local">
                <input
                  type="radio"
                  required="required"
                  name="radio"
                  className="form-check-input"
                  placeholder="Required"
                />
                Local
              </div>
            </div>
            <div className="BrowseFile">
              {/* <div className="Browse">Browse File</div> */}
              <div className="Browse"><input type='file'/></div>
              <div>
                <button
                  className="btn btn-primary"
                  onClick={() => this.PopUpShow()}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
