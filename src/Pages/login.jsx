import React from 'react';
import '../css/login.css';
import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js';
import Timer from '../Components/timer';
import notify from '../utils';
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            emailForOtp:null,otp1:null,otp2:null,otp3:null,otp4:null,otp5:null,
            name : '',
            password : '',
            user_mail:'',
            new_pass:'',
            confirm_pass:'',text: '',
            index: 0,
            get_user_list:null,
            errormsg: null,
            passwordVerificationError: null,
            forgot_popup:false,
            fadeLogin:{opacity:'0'},serverIP:process.env.REACT_APP_CLIENT_IP,
            otpSent:false,newPassSet:false,showErrorForEmail:null,
            startTimer:false
        }
        this.loginClick= this.loginClick.bind(this);
        this.enterKey=this.enterKey.bind(this);
        this._handleKeyPress = this._handleKeyPress.bind(this);
        this.updatePassword=this.updatePassword.bind(this);
        this.timerStatus = this.timerStatus.bind(this);
    }
    handlePassword(event) {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if(this.state.name==='admin@hfcl.com'){
            this.setState({password:event.target.value})
        }
        else{
            if (regex.test(event.target.value) === false) {
                this.setState({
                  errormsg: "Password must be at least 8 char long and should contain a mix of numbers,alphabet and special characters."
                });
              } else {
                this.setState({
                  errormsg: null,
                  password: event.target.value
                });
              }
        }
      
    }
    componentDidMount() {
      const typewriterText = 'Leading Digital Optical Solutions';
      const typewriterText2 = 'Element Management System For Transport Router';
      const typingSpeed = 50;
      this.typingInterval = setInterval(() => {
        if (this.state.index < typewriterText.length || this.state.index < typewriterText2.length) {
          this.setState((prevState) => ({
            text: typewriterText.substring(0, prevState.index + 1),
            text2: typewriterText2.substring(0, prevState.index + 1),
            index: prevState.index + 1,
          }));
        } else {
          clearInterval(this.typingInterval);
        }
      }, typingSpeed);
    }
    componentWillUnmount() {
      clearInterval(this.typingInterval);
    }
    async handleRegister() {
      
      const message = this.state.password;
      const key = 'mySecretKey12345';
      const iv='0123456789abcdef'
      const encryptedPassword =CryptoJS.AES.encrypt(message, CryptoJS.enc.Utf8.parse(key),{ iv: CryptoJS.enc.Utf8.parse(iv), mode: CryptoJS.mode.CBC }).toString();
      this.setState({encrypted_password:encryptedPassword})
              // Send the email and encrypted password to the server }
    }
    async loginClick() {
        var temp={'username':this.state.name,'password':this.state.password}
        if (this.state.name==='' || this.state.password===''){
            notify("Please enter the email and password",'error');
        }
        else if (this.state.password.length<8){
          notify("Password length should greater than 8",'error');
        }
        else if(!this.isValidEmail(this.state.name)){
          notify("Please enter a valid email",'error');
        }
        else {
            const message = this.state.password;
            const key = 'AAAAAAAAAAAAAAAA';
            const iv = 'BBBBBBBBBBBBBBBB';
            const encryptedPassword = CryptoJS.AES.encrypt(message, CryptoJS.enc.Utf8.parse(key),{ iv: CryptoJS.enc.Utf8.parse(iv), mode: CryptoJS.mode.CBC }).toString();
            temp["password"]=encryptedPassword
            fetch(`http://${this.state.serverIP}:5006/user-management/login`, {                     
                method: 'POST', 
                mode: 'cors',  
                headers:{'Access-Control-Allow-Origin':'http://localhost:3000',  
                          'Accept':'application/json', 
                          'Content-Type':'application/json',
                          'username': sessionStorage.getItem('username'),
                          //   'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY2Njc2NzE3NSwianRpIjoiODFkOTNiMGEtNDQwMS00ZDIyLWIzYmItOGM0NmZkZDBjODJiIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluXzEyMyIsIm5iZiI6MTY2Njc2NzE3NSwiZXhwIjoxNjY5MzU5MTc1fQ.bPHBU62WQd-2Z4cmDkEYaL-198KTSmp6w1A49i4U3a4',
                      }, 
                      body: JSON.stringify(temp)               
                })
                .then(resp=>resp.json())
                .then(resp=>{this.setState({login_role_response:resp})
                ;
                sessionStorage.setItem('login_data',JSON.stringify(resp))
                sessionStorage.setItem('username',this.state.name)
                if (resp.status === 'As you are logging in for the first time, please reset your password to proceed further.') {
                  Swal.fire({
                    position: 'center',
                    title: 'As you are logging in for the first time, please reset your password to proceed further',
                    icon: 'info',
                    showConfirmButton: true,
                    showCancelButton: false,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#116C39',
                    customClass: {
                        title: 'custom-swal-title', // Define a custom class for the title
                    },
                }).then((result) => {
                    if (result.isConfirmed) {
                        sessionStorage.setItem('email', this.state.name);
                        window.location.href = './password';
                    }
                });
              }
                else if(resp.status==='Your password has expired, please reset it to proceed further'){
                  Swal.fire({
                    position: 'center',
                    title: resp.status,
                    icon: 'warning',
                    showConfirmButton: true,
                    showCancelButton: false,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#116C39',
                    customClass: {
                        title: 'custom-swal-title', // Define a custom class for the title
                    },
                }).then((result) => {
                    if (result.isConfirmed) {
                      sessionStorage.setItem('email',this.state.name);
                      window.location.href='./password'
                    }
                });
                }
                else if(resp.status === "you are blocked for 60 seconds due to consecutive failed login attempts"){
                  this.setState({errormsg:resp.status,startTimer:true})
                }
                else if(resp.data){
                  sessionStorage.setItem('role_id',this.state.login_role_response.data.role);
                    sessionStorage.setItem('_id',this.state.login_role_response.data._id);
                    Swal.fire({
                        position: 'center',
                        title: 'Log In Successful',
                        icon : 'success',
                        showConfirmButton: false,
                        timer : 15000,
                        color: '#116C39',
                    })
                    window.location.href='./network';
                }
                else{
                  this.setState({errormsg:resp.status})
                }
                
              })
              .catch((err) => {
                if (err.response) {
                  Swal.fire({
                    position: 'center',
                    title: err.response.data.status,
                    icon: 'error',
                    showConfirmButton: true,
                    showCancelButton: false,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#116C39',
                    customClass: {
                        title: 'custom-swal-title', // Define a custom class for the title
                    },
                });
                }
              });  
        }
    }
    timerStatus(data) {
      if(data){
        this.setState({errormsg:null})
      }
    }
    enterKey(e){
        if(e.key==="Enter"){
          this.loginClick();
        }
    }
    _handleKeyPress(e, field) {
        if (e.keyCode === 13) {
          e.preventDefault(); // Prevent form submission if button present
          let next = this.refs[field.name].nextSibling;
          if (next && next.tagName === "INPUT") {
            this.refs[field.name].nextSibling.focus();
          }
        }
    }
    generateOTP(){
      var isValid=this.isValidEmail(this.state.emailForOtp)
      if(this.state.emailForOtp){
        if(isValid){
          this.setState({showErrorForEmail:null})
          var temp={}
          temp['email']=this.state.emailForOtp
          fetch(`http://${this.state.serverIP}:5006/user-management/generate-otp`, {                     
              method: 'POST', 
              mode: 'cors',  
              headers:{'Access-Control-Allow-Origin':'http://localhost:3000',  
                        'Accept':'application/json', 
                        'Content-Type':'application/json',
                        'username': sessionStorage.getItem('username')
                      //   'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY2Njc2NzE3NSwianRpIjoiODFkOTNiMGEtNDQwMS00ZDIyLWIzYmItOGM0NmZkZDBjODJiIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluXzEyMyIsIm5iZiI6MTY2Njc2NzE3NSwiZXhwIjoxNjY5MzU5MTc1fQ.bPHBU62WQd-2Z4cmDkEYaL-198KTSmp6w1A49i4U3a4',
                    }, 
                    body: JSON.stringify(temp)               
              })
              .then(resp=>resp.json())
              .then(resp=>{this.setState({otpResponse:resp})
              ;
              if(resp.status==="Successfully sent OTP to your email"){
                this.setState({otpSent:true,forgot_popup:false})
              }
              this.setState({showErrorForEmail:resp.status})
            })
            .catch((err) => {
              if (err.response) {
                Swal.fire({
                  position: 'center',
                  title: err.response.data.status,
                  icon: 'error',
                  showConfirmButton: true,
                  showCancelButton: false,
                  confirmButtonText: 'OK',
                  confirmButtonColor: '#116C39',
                  customClass: {
                      title: 'custom-swal-title', // Define a custom class for the title
                  },
              });
              }
            }); 
        }
        else{
          this.setState({showErrorForEmail:'Please provide valid email address'})
        }
        
      }
      else{
        this.setState({showErrorForEmail:'Please fill the field first'})
      }
         
    }
    callUpdatePassword(){
        var a=this.state.otp1.toString()+this.state.otp2.toString()+this.state.otp3.toString()+this.state.otp4.toString()+this.state.otp5.toString()+this.state.otp6.toString()
        var temp={}
        temp['email']=this.state.emailForOtp
        temp['otp']=a
        fetch(`http://${this.state.serverIP}:5006/user-management/verify-otp`, {                     
            method: 'POST', 
            mode: 'cors',  
            headers:{'Access-Control-Allow-Origin':'http://localhost:3000',  
                      'Accept':'application/json', 
                      'Content-Type':'application/json',
                      'username': sessionStorage.getItem('username'),
                    //   'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY2Njc2NzE3NSwianRpIjoiODFkOTNiMGEtNDQwMS00ZDIyLWIzYmItOGM0NmZkZDBjODJiIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluXzEyMyIsIm5iZiI6MTY2Njc2NzE3NSwiZXhwIjoxNjY5MzU5MTc1fQ.bPHBU62WQd-2Z4cmDkEYaL-198KTSmp6w1A49i4U3a4',
                  }, 
                  body: JSON.stringify(temp)               
            })
            .then(resp=>resp.json())
            .then(resp=>{this.setState({verifyotpResp:resp})
            ;
            Swal.fire({
              position: 'center',
              title: resp.status,
              icon: 'success',
              showConfirmButton: true,
              showCancelButton: false,
              confirmButtonText: 'OK',
              confirmButtonColor: '#116C39',
              customClass: {
                  title: 'custom-swal-title', // Define a custom class for the title
              },
          }).then((result) => {
              if (result.isConfirmed) {
                this.setState({newPassSet:true,forgot_popup:false,otpSent:false})
              }
          });
          })
          .catch((err) => {
            if (err.response) {
              Swal.fire({
                position: 'center',
                title: err.response.data.status,
                icon: 'error',
                showConfirmButton: true,
                showCancelButton: false,
                confirmButtonText: 'OK',
                confirmButtonColor: '#116C39',
                customClass: {
                    title: 'custom-swal-title', // Define a custom class for the title
                },
            });
            }
          });  
        
    }
    updatePassword(){
      var temp={}
      temp["email"]=this.state.emailForOtp
      const message1 = this.state.new_pass;
      const message2 = this.state.confirm_pass;
      const key = 'AAAAAAAAAAAAAAAA';
      const iv = 'BBBBBBBBBBBBBBBB';
      const encryptedPassword_new = CryptoJS.AES.encrypt(message1, CryptoJS.enc.Utf8.parse(key),{ iv: CryptoJS.enc.Utf8.parse(iv), mode: CryptoJS.mode.CBC }).toString();
      const encryptedPassword_confirm = CryptoJS.AES.encrypt(message2, CryptoJS.enc.Utf8.parse(key),{ iv: CryptoJS.enc.Utf8.parse(iv), mode: CryptoJS.mode.CBC }).toString();

      temp["new_password"]=encryptedPassword_new
      temp["confirm_password"]=encryptedPassword_confirm
      temp["request_type"]="forgot_password"
      if((this.state.new_pass.length>=8)&&(this.state.confirm_pass===this.state.new_pass)){
          fetch(`http://${this.state.serverIP}:5006/user-management/reset-password`, {                     
              method: 'POST', 
              mode: 'cors',  
              headers:{'Access-Control-Allow-Origin':'http://localhost:3000',  
                        'Accept':'application/json', 
                        'Content-Type':'application/json',
                        'username': sessionStorage.getItem('username'),
                      //   'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY2Njc2NzE3NSwianRpIjoiODFkOTNiMGEtNDQwMS00ZDIyLWIzYmItOGM0NmZkZDBjODJiIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluXzEyMyIsIm5iZiI6MTY2Njc2NzE3NSwiZXhwIjoxNjY5MzU5MTc1fQ.bPHBU62WQd-2Z4cmDkEYaL-198KTSmp6w1A49i4U3a4',
                    }, 
                    body: JSON.stringify(temp)               
              })
              .then(resp=>resp.json())
              .then(resp=>{this.setState({resetPasswordResp:resp})
              ;
              Swal.fire({
                position: 'center',
                title: resp.status,
                icon: 'success',
                showConfirmButton: true,
                showCancelButton: false,
                confirmButtonText: 'OK',
                confirmButtonColor: '#116C39',
                customClass: {
                    title: 'custom-swal-title', // Define a custom class for the title
                },
            }).then((result) => {
                if (result.isConfirmed) {
                  if(resp.status==='Password reset successful, please login with new password'){
                    this.setState({newPassSet:false,otpSent:false})
                }
                }
            });
            })
            .catch((err) => {
              if (err.response) {
                Swal.fire({
                  position: 'center',
                  title: err.response.data.status,
                  icon: 'error',
                  showConfirmButton: true,
                  showCancelButton: false,
                  confirmButtonText: 'OK',
                  confirmButtonColor: '#116C39',
                  customClass: {
                      title: 'custom-swal-title', // Define a custom class for the title
                  },
              });
              }
            });  
      }
      else{
          if(!(this.state.confirm_pass===this.state.new_pass)){
              this.setState({passwordVerificationError:'Passwords not matching'})
          }
          else{
              this.setState({passwordVerificationError:'Enter more than 8 characters'})
          }
      }
    }
    handleKeyUp = (event, nextInputId) => {
        const input = event.target;
        const inputLength = input.value.length;
        const maxLength = input.getAttribute('maxlength');
    
        if (inputLength >= maxLength) {
          const nextInput = document.getElementById(nextInputId);
    
          if (nextInput) {
            nextInput.focus();
          }
        }
    };
    handleKeyDown = (event, prevInputId) => {
      const input = event.target;
      const inputValue = input.value;
      const inputLength = inputValue.length;
  
      if (event.keyCode === 8 && inputLength === 0) {
        const prevInput = document.getElementById(prevInputId);
  
        if (prevInput) {
          prevInput.focus();
        }
      }
    };
    isValidEmail(email) {
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      return emailPattern.test(email);
    }
    render() { 
        return ( 
                <div className='MainPage'>
                <div className='logo-wrapper'>
                <div className='logoTextSection'>
                  <img className='logoCenter' src={require('../Images/hfcl_logo.png')} alt="Logo" />
                  <div className='logoTextBottom'>{this.state.text}</div>
                </div>
                <div className='logoTextSectionBottom'>
                  <div className='logoTextBottom' style={{fontSize:'20px'}}>{this.state.text2}</div>
                </div>
                </div>
                {!(this.state.forgot_popup || this.state.otpSent || this.state.newPassSet)?(
                  <div className={"login-box"}>
                    <div className='tagline' style={{textAlign:'center'}}>SIGN IN</div>
                    <div style={{color:'darkgoldenrod',fontSize:'11px',textAlign:'center'}}>{this.state.errormsg}</div>
                    <div style={{textAlign:'center'}}>
                    {this.state.startTimer?(
                      <Timer timerStatus={this.timerStatus}/>
                    ):null}
                    </div>
                    <form  onSubmit={(e) => e.preventDefault()}>
                        <div className="user-box" id='myForm'>
                          <input
                            onChange={(event) => { this.setState({ name: event.target.value }) }}
                            name="user"
                            value={this.state.name}
                            required=""
                            onKeyPress={this.enterKey}
                          />
                          <label>Username</label>
                        </div>
                        <div className="user-box">
                          <input
                            onChange={(event) => this.handlePassword(event)}
                            style={{ WebkitTextSecurity: 'disc', textSecurity: 'disc', background: 'transparent' }}
                            type="password"
                            onKeyPress={this.enterKey}
                            autoComplete="password"
                          />
                          <label>Password</label>
                        </div>
                        <div className="forgot" onClick={()=>this.setState({forgot_popup:true})}>Forgot Password?</div>
                        <button type="submit" className='loginbut' value="Login" onClick={this.loginClick} href="/#">
                          Log In
                        </button>
                    </form>
                  </div>
                ):null}
                {this.state.forgot_popup || this.state.otpSent || this.state.newPassSet?(
                  <div className={"login-box"}>
                        <div className='forgotModule ' style={{opacity:'2'}}>
                            <div style={{position:'absolute',cursor:'pointer',right:'25px',top:'0',fontSize:'25px',color:'white'}} onClick={()=>this.setState({forgot_popup:false,otpSent:false,newPassSet:false})}>&times;</div>
                            {this.state.forgot_popup?(
                                <div>
                                <div className='tagline'>Forgot Password?</div>
                                <div className='tagline' style={{marginTop:'0px',fontSize:'small'}}>Enter your Email Address here</div>
                                <form style={{marginTop:'20%'}}>
                                    <div className="user-box">
                                    <input type="text" name="" required="" onKeyPre onChange={(e)=>this.setState({emailForOtp:e.target.value})}/>
                                    <p style={{color:'darkgoldenrod',fontSize:'11px'}}>{this.state.showErrorForEmail}</p>
                                    </div>
                                    <a href="/#" className='loginbut'  type="submit" value="Update" onClick={()=>this.generateOTP()}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    Generate OTP
                                    </a>
                                </form>
                                </div>
                            ):null}
                            {this.state.otpSent?(
                                <div className="container">
                                    <div className='tagline'>ENTER OTP</div>
                                    <div className="userInput" >
                                        <input className='otpText' type="text" id='ist' maxlength="1" onKeyUp={(event) => this.handleKeyUp(event, 'sec')} onKeyDown={(event) => this.handleKeyDown(event, 'ist')} onChange={(e)=>this.setState({otp1:e.target.value})}/>
                                        <input className='otpText' type="text" id="sec" maxlength="1"  onKeyUp={(event) => this.handleKeyUp(event, 'third')}  onKeyDown={(event) => this.handleKeyDown(event, 'ist')} onChange={(e)=>this.setState({otp2:e.target.value})}/>
                                        <input className='otpText' type="text" id="third" maxlength="1" onKeyUp={(event) => this.handleKeyUp(event, 'fourth')} onKeyDown={(event) => this.handleKeyDown(event, 'sec')} onChange={(e)=>this.setState({otp3:e.target.value})}/>
                                        <input className='otpText' type="text" id="fourth" maxlength="1"  onKeyUp={(event) => this.handleKeyUp(event, 'fifth')} onKeyDown={(event) => this.handleKeyDown(event, 'third')} onChange={(e)=>this.setState({otp4:e.target.value})}/>
                                        <input className='otpText' type="text" id="fifth" maxlength="1" onKeyUp={(event) => this.handleKeyUp(event, 'sixth')} onKeyDown={(event) => this.handleKeyDown(event, 'fourth')}  onChange={(e)=>this.setState({otp5:e.target.value})}/>
                                        <input className='otpText' type="text" id="sixth" maxlength="1" onKeyDown={(event) => this.handleKeyDown(event, 'fifth')} onChange={(e)=>this.setState({otp6:e.target.value})}/>
                                    </div>
                                    <button className='confirmRole' style={{marginBottom:'10px',backgroundColor:'#3d9be1',marginTop:'15%'}} onClick={()=>this.callUpdatePassword()}>CONFIRM</button>
                                </div>
                            ):null}
                            {this.state.newPassSet?(
                              <div>
                                    <div style={{color:'darkgoldenrod',fontSize:'11px'}}>{this.state.passwordVerificationError}</div>
                                    <div style={{marginTop:'20%'}} className="user-box" id='myForm'>
                                      <input
                                          onChange={(event) => { this.setState({ new_pass: event.target.value }) }} style={{ WebkitTextSecurity: 'disc', textSecurity: 'disc' }} type="text" name="user" required=""  autocomplete="off"   placeholder='Aertz27@#' onKeyPress={this.enterKey}
                                      />
                                      <label>New Password</label>
                                    </div>
                                    <div  style={{marginTop:'20%'}} className="user-box" id='myForm'>
                                      <input
                                          onChange={(event) => { this.setState({ confirm_pass: event.target.value }) }} style={{ WebkitTextSecurity: 'disc', textSecurity: 'disc' }} type="text" name="user" required=""  autocomplete="off"   placeholder='Aertz27@#' onKeyPress={this.enterKey} 
                                      />
                                      <label>Confirm Password</label>
                                    </div>
                                    <button className="confirmRole" style={{marginBottom:'10px',backgroundColor:'#3d9be1',margin:'0'}} type="submit" value="Update" onClick={()=>this.updatePassword()}>Confirm</button>
                                </div>
                            ):null}
                        </div>
                  </div>
                ):null}
                
                </div>
        );
    }
}
export default Login;
