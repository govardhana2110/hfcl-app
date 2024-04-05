import React, { Component } from 'react';
import CryptoJS from 'crypto-js';
import Swal from 'sweetalert2';

class UpdatePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: null,
      old_pass: '',
      new_pass: '',
      confirm_pass: '',
      serverIP: process.env.REACT_APP_CLIENT_IP,
      errorMessage: '',
    };
  }

  componentDidMount() {
    const email = sessionStorage.getItem('username');
    this.setState({ email });
  }
  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  updatePassword = () => {
    const { old_pass, new_pass, confirm_pass, email } = this.state;
    const key = 'AAAAAAAAAAAAAAAA';
    const iv = 'BBBBBBBBBBBBBBBB';

    // Check for password length and special character
    if (new_pass.length < 8 || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(new_pass)) {
      this.setState({ errorMessage: 'Password must be at least 8 characters and contain at least one special character' });
      return;
    }
    if (new_pass !== confirm_pass) {
        this.setState({ errorMessage: 'New password and confirm password do not match' });
        return;
      }
    // Encrypt passwords
    const encryptedPassword_old = CryptoJS.AES.encrypt(old_pass, CryptoJS.enc.Utf8.parse(key), { iv: CryptoJS.enc.Utf8.parse(iv), mode: CryptoJS.mode.CBC }).toString();
    const encryptedPassword_new = CryptoJS.AES.encrypt(new_pass, CryptoJS.enc.Utf8.parse(key), { iv: CryptoJS.enc.Utf8.parse(iv), mode: CryptoJS.mode.CBC }).toString();
    const encryptedPassword_confirm = CryptoJS.AES.encrypt(confirm_pass, CryptoJS.enc.Utf8.parse(key), { iv: CryptoJS.enc.Utf8.parse(iv), mode: CryptoJS.mode.CBC }).toString();

    const passSet = {
      email,
      old_password: encryptedPassword_old,
      new_password: encryptedPassword_new,
      confirm_password: encryptedPassword_confirm,
      request_type: 'reset_password',
    };

    fetch(`http://${this.state.serverIP}:5006/user-management/reset-password`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'username': sessionStorage.getItem('username'),
      },
      body: JSON.stringify(passSet),
    })
      .then(resp => resp.json())
      .then(resp => {
        console.log(resp, 'resetPasswordResponse');
        if (resp.status === 'Password reset successful, please login with new password') {
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
              window.location.href='/'
            }
        });
        } else {
          Swal.fire({
            position: 'center',
            title: resp.status,
            icon: 'info',
            showConfirmButton: true,
            showCancelButton: false,
            confirmButtonText: 'OK',
            confirmButtonColor: '#116C39',
            customClass: {
                title: 'custom-swal-title', // Define a custom class for the title
            },
        })
        }
      });
  };

  render() {
    const { errorMessage } = this.state;

    return (
      <div className='MainPage'>
                <div className='logoTextSection'>
                  <img className='logoCenter' src={require('../Images/hfcl_logo.png')} alt="Logo" />
                  <div className='logoTextBottom'>Leading Digital Optical Solutions</div>
                </div>
                <div className='logoTextSectionBottom'>
                  <div className='logoTextBottom' style={{fontSize:'20px'}}>Element Management System For Transport Router</div>
                </div>
        <div className='forgotModule login-box' style={{ height: '68%' }}>
          <div className='errormsg'>{errorMessage}</div>
          <div>
            <div style={{ marginTop: '20%' }} className="user-box" id='myForm'>
              <input
                onChange={this.handleInputChange}
                type="password" // Change input type to "password"
                name="old_pass"
                required=""
                autoComplete="off"
              />
              <label>Old Password</label>
            </div>
            <div style={{ marginTop: '20%' }} className="user-box" id='myForm'>
              <input
                onChange={this.handleInputChange}
                type="password" // Change input type to "password"
                name="new_pass"
                required=""
                autoComplete="off"
              />
              <label>New Password</label>
            </div>
            <div style={{ marginTop: '20%' }} className="user-box" id='myForm'>
              <input
                onChange={this.handleInputChange}
                type="password" // Change input type to "password"
                name="confirm_pass"
                required=""
                autoComplete="off"
              />
              <label>Confirm Password</label>
            </div>
            <div class="col-auto" onClick={this.updatePassword}>
                <button type="submit" class="btn btn-primary mb-3">Confirm</button>
              </div>
          </div>
        </div>
      </div>
    );
  }
}

export default UpdatePassword;
