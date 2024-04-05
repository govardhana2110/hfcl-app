import React from 'react';
import NewHeader from '../Components/header';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/TextField';
import swal from 'sweetalert2';
import Tooltip from '@mui/material/Tooltip';
import garbage from '../Images/garbage.png';
import edit from '../Images/edit.png';
import password from '../Images/padlock.png';
import email from '../Images/email.png';
import name from '../Images/user.png';
import role from '../Images/group.png';
import user_logo from '../Images/user_logo.png';
import add from '../Images/add.png';
import close from '../Images/closeS.png';
import Pagination from "react-js-pagination";
import { PageItem as BootstrapPageItem } from 'react-bootstrap';
import CryptoJS from 'crypto-js';
import sortDown from '../Images/dropDown.png'
import sortUp from '../Images/arrow-up.png'
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import Loading from '../Components/loader';
import Upload from '../Components/uploadFile';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";

class UserPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sortColumn: null,
            sortDirection: null,
            selectedthSort: null, fixthHead: { color: '#297c97e3', cursor: 'pointer' },
            usersList: [],
            get_filtered_alarms: [],
            activePage: 1, isOpen: false,
            itemsPerPage: 5,
            fade_content: { opacity: '0.1' },
            user_unique_id: null, disabled: true,
            fade_out: { opacity: '0.5' }, serverIP: process.env.REACT_APP_CLIENT_IP,
            get_user_list: null, add_user_response: null, delete_user_response: null, update_user_response: null,
            first_name: null, last_name: null, role: null, password: null, email: null,
            showUpdateUserTab: false,
            user_id: null, loginData: null, pdfData: null,
            to_update_first_name: null, to_update_last_name: null, to_update_email: null, to_update_role: null,
            showAddNewUserTab: false, showModifyUserRole: false,
            NewLicense: false, countUser: null, searchTerm: null, csvReport: null,
            userRole: null, userID: null, openLicensePopup: false, licenseID: null, getLicense: null, openAddLicense: false,
            selectedRoleFilters: [], selectedSeverityFilter: { backgroundColor: '#004f68c4', color: 'white' }, openFilterPopup: false,
            timestamp_Filter: { start_time: new Date(), stop_time: new Date() },
            get_filtered_user_info: [],
        }
        this.add_user = this.add_user.bind(this);
        this.delete_user = this.delete_user.bind(this);
        this.get_users = this.get_users.bind(this);
        this.update_user_tab = this.update_user_tab.bind(this);
        this.modify_user = this.modify_user.bind(this);
        this.showAddNewUserTab = this.showAddNewUserTab.bind(this);
        this.showModifyUserRole = this.showModifyUserRole.bind(this);
    }

    setDefaultTime() {
        const { timestamp_Filter } = this.state;
        var currentDate = new Date();
        var oneMonthAgo = new Date(currentDate);
        oneMonthAgo.setMonth(currentDate.getMonth() - 1);
        currentDate = this.convertDateFormat(currentDate);
        oneMonthAgo = this.convertDateFormat(oneMonthAgo);
        console.log(currentDate, oneMonthAgo, 'ghefdwehfiuwehf8oewfhuiwefh');
        timestamp_Filter["start_time"] = oneMonthAgo;
        timestamp_Filter["stop_time"] = currentDate;
        this.setState({ timestamp_Filter });
    }
    convertDateFormat(inputDateStr) {
        const inputDate = new Date(inputDateStr);
        return inputDate.toISOString(); // Returns date in ISO 8601 format
    }

    componentDidMount() {
        sessionStorage.setItem('Connection', false)
        var userRole = sessionStorage.getItem('role_id')
        var userID = sessionStorage.getItem('_id')
        var loginData = JSON.parse(sessionStorage.getItem('login_data'))
        this.setState({ loginData: loginData.data })
        console.log(loginData)
        console.log(userRole, 'userrorlr;fmerjfhvefuivh')
        this.setState({ userRole: userRole, userID: userID })
        this.get_users(loginData.data)
        this.getLicense(loginData.data)
        this.setDefaultTime()
    }

    getLicense(loginData) {
        fetch(`http://${this.state.serverIP}:5006/user-management/license-details`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'username': sessionStorage.getItem('username'),
                'Authorization': 'Bearer ' + loginData.access_token,
            },
        })
            .then(resp => resp.json())
            .then(resp => {
                console.log(resp)
                if (!resp.message) {
                    this.setState({ licenceDetails: resp })
                }
            })
    }
    get_users(loginData) {
        console.log(loginData)
        var userID = sessionStorage.getItem('_id')
        var _id = {}
        _id['login_user_id'] = userID
        console.log(_id)
        fetch(`http://${this.state.serverIP}:5006/user-management/users`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'username': sessionStorage.getItem('username'),
                'Authorization': 'Bearer ' + loginData.access_token,
            },
            body: JSON.stringify(_id)
        })
            .then(resp => resp.json())
            .then(resp => {
                if (!resp.status) {

                    this.setState({ get_user_list: resp, pdfData: resp, usersList: resp, get_filtered_user_info: resp })
                }
                console.log(resp)
                    ;

                var countUser = [[], [], []]
                for (let i = 0; i < resp.length; i++) {
                    if (resp[i].role === 'NETWORK-ENGINEER') {
                        countUser[0].push(resp[i].first_name)
                    }
                    else if (resp[i].role === 'NETWORK-OPERATOR') {
                        countUser[1].push(resp[i].first_name)
                    }
                    else {
                        countUser[2].push(resp[i].first_name)
                    }
                }
                this.setState({ countUser: countUser })
                console.log(resp)
                var UserHeaders = [
                    { label: "First Name", key: "first_name" },
                    { label: "Last Name", key: "last_name" },
                    { label: "Email", key: "email" },
                    { label: "Role", key: "role" },
                    { label: "Date Added", key: "date_added" },
                    { label: "Date Modified", key: "date_modifed" },
                    { label: "Last Log In Time", key: "login_time" },

                ];
                var UserData = []
                for (let i = 0; i < resp.length; i++) {
                    let headerDict = {}
                    headerDict = {
                        first_name: resp[i].first_name,
                        last_name: resp[i].last_name,
                        email: resp[i].email,
                        role: resp[i].role,
                        date_added: resp[i].date_added,
                        date_modifed: resp[i].date_modified,
                        login_time: resp[i].login_time,
                    }
                    UserData.push(headerDict);
                }
                this.setState({
                    csvReport: {
                        data: UserData,
                        headers: UserHeaders,
                        filename: 'UserReport.csv'
                    }
                })
            })
            .catch((err) => {
                console.log(err)
                this.setState({ get_user_list: [], pdfData: [], usersList: [], get_filtered_user_info: [] })
                if (err.response) {
                    alert(err.response.data.status)
                    console.log('Error Response Data:', err.response.data);
                    console.log('Error Response Status:', err.response.status);
                    console.log('Error Response Headers:', err.response.headers);
                }
            });
    }
    add_user() {
        if (this.state.first_name && this.state.last_name && this.state.role) {
            const nameRegex = /^[A-Za-z]+$/;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (
                nameRegex.test(this.state.first_name) &&
                nameRegex.test(this.state.last_name)
            ) {
                if (emailRegex.test(this.state.email)) {
                    if (this.state.password === this.state.confirmPassword) {
                        console.log('in')
                        this.setState({ is_fetching: true })
                        var user_data = {
                            first_name: this.state.first_name,
                            last_name: this.state.last_name,
                            email: this.state.email,
                            password: this.state.password,
                            role: this.state.role,
                            login_user_id: this.state.userID,
                        };
                        if (this.state.userRole === "NETWORK-ADMIN") {
                            user_data["product"] = this.state.product;
                        }
                        console.log(user_data, "userdaata");
                        const message = this.state.password;
                        const key = "AAAAAAAAAAAAAAAA";
                        const iv = "BBBBBBBBBBBBBBBB";
                        const encryptedPassword = CryptoJS.AES.encrypt(
                            message,
                            CryptoJS.enc.Utf8.parse(key),
                            {
                                iv: CryptoJS.enc.Utf8.parse(iv),
                                mode: CryptoJS.mode.CBC,
                            }
                        ).toString();
                        user_data["password"] = encryptedPassword;
                        fetch(`http://${this.state.serverIP}:5006/user-management/add-user`, {
                            method: "POST",
                            mode: "cors",
                            headers: {
                                "Access-Control-Allow-Origin": "http://localhost:3000",
                                Accept: "application/json",
                                "Content-Type": "application/json",
                                username: sessionStorage.getItem("username"),
                                Authorization: "Bearer " + this.state.loginData.access_token,
                            },
                            body: JSON.stringify(user_data),
                        })
                            .then((resp) => resp.json())
                            .then((resp) => {
                                this.setState({ add_user_response: resp });
                                console.log(resp);
                                if (resp.status.includes("user has been added")) {
                                    swal.fire({
                                        title: "Success",
                                        text: resp.status,
                                        width: 300,
                                        height: 40,
                                        color: "",
                                        icon: "success",
                                    });
                                } else {
                                    swal.fire({
                                        title: "Failed",
                                        text: resp.status,
                                        width: 300,
                                        height: 40,
                                        color: "",
                                        icon: "failed",
                                    });
                                }
                                this.setState({ is_fetching: false });
                                this.get_users(this.state.loginData);
                                this.showAddNewUserTab();
                            })
                            .catch((err) => {
                                if (err.response) {
                                    alert(err.response.data.status);
                                    console.log("Error Response Data:", err.response.data);
                                    console.log("Error Response Status:", err.response.status);
                                    console.log("Error Response Headers:", err.response.headers);
                                }
                            });
                        console.log(user_data);
                    } else {
                        if (this.state.password) {
                            this.setState({ errorMessage: 'Password Does not Match' })
                        } else {
                            this.setState({ errorMessage: "Password Doesn't Follow The Criteria" })
                        }
                    }
                }
                else {
                    this.setState({ errorMessage: 'Please Provide a valid Email' })
                }
            }
        }
        else {
            this.setState({ errorMessage: 'Please fill all the fields' })
        }
    }
    delete_user(e, id) {
        var id1 = id
        console.log(id1, 'id')
        var RoleID = {}
        RoleID['login_user_id'] = this.state.userID
        console.log(RoleID, 'roleeeeeeeeeeeeee')
        swal.fire({
            title: "This account will be deleted permanently!",
            text: "Are you sure to proceed?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Remove the Account!",
            cancelButtonText: "I am not sure!",
            closeOnConfirm: false,
            closeOnCancel: false
        })
            .then((result) => {
                if (result.isConfirmed) {
                    fetch(`http://${this.state.serverIP}:5006/user-management/delete-user/${id1}`, {
                        method: 'DELETE',
                        mode: 'cors',
                        headers: {
                            'Access-Control-Allow-Origin': 'http://localhost:3000',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'username': sessionStorage.getItem('username'),
                            'Authorization': 'Bearer ' + this.state.loginData.access_token,
                        },
                        body: JSON.stringify(RoleID)
                    })
                        .then(resp => resp.json())
                        .then(resp => {
                            this.setState({ delete_user_response: resp })
                            ;
                            console.log(this.state.delete_user_response)
                            this.get_users(this.state.loginData);
                            this.setState({ show_delete_confirmation_popup: false })
                        })
                        .catch((err) => {
                            if (err.response) {
                                alert(err.response.data.status)
                                console.log('Error Response Data:', err.response.data);
                                console.log('Error Response Status:', err.response.status);
                                console.log('Error Response Headers:', err.response.headers);
                            }
                        });
                    swal.fire("Account Removed!", "Your account is removed permanently!", "success");
                }
            });
    }
    update_user_tab(id, first_name, last_name, email, role) {
        this.setState({ showUpdateUserTab: true, user_id: id, errormsg: '' })
        this.setState({ to_update_first_name: first_name, to_update_last_name: last_name, to_update_email: email, to_update_role: role })
    }
    modify_user() {
        var id = this.state.user_id
        var temp = {
            'first_name': this.state.to_update_first_name,
            'last_name': this.state.to_update_last_name,
            'email': this.state.to_update_email,
            'role': this.state.to_update_role,
            'login_user_id': this.state.userID
        }
        if (this.state.to_update_first_name && this.state.to_update_last_name && this.state.to_update_email && this.state.to_update_role) {
            const nameRegex = /^[A-Za-z]+$/;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (nameRegex.test(this.state.to_update_first_name) && nameRegex.test(this.state.to_update_last_name)) {
                if (emailRegex.test(this.state.to_update_email)) {
                    this.setState({ is_fetching: true, showUpdateUserTab: false })
                    fetch(`http://${this.state.serverIP}:5006/user-management/update-user/${id}`, {
                        method: 'PATCH',
                        mode: 'cors',
                        headers: {
                            'Access-Control-Allow-Origin': 'http://localhost:3000',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'username': sessionStorage.getItem('username'),
                            'Authorization': 'Bearer ' + this.state.loginData.access_token,
                        },
                        body: JSON.stringify(temp)
                    })
                        .then(resp => resp.json())
                        .then(resp => {
                            this.setState({ update_user_response: resp, is_fetching: false })
                            ;
                            console.log(this.state.update_user_response)
                            swal.fire({
                                title: 'Success',
                                text: 'Succesfully Modified',
                                width: 300,
                                height: 40,
                                color: '',
                                icon: 'success',
                            })
                            this.get_users(this.state.loginData);
                        })
                        .catch((err) => {
                            if (err.response) {
                                alert(err.response.data.status)
                                console.log('Error Response Data:', err.response.data);
                                console.log('Error Response Status:', err.response.status);
                                console.log('Error Response Headers:', err.response.headers);
                            }
                        });
                    console.log(id)
                }
                else {
                    this.setState({ errormsg: 'Please Provide Valid Email' })
                }
            }
            else {
                this.setState({ errormsg: 'First name and Last name should only contain characters (letters).' })
            }
        }
        else {
            this.setState({ errormsg: 'Please Fill All the Details' })
        }
    }
    showAddNewUserTab() {
        if (this.state.showAddNewUserTab) {
            this.setState({ showAddNewUserTab: false })
        }
        else {
            this.setState({ showAddNewUserTab: true })
        }
        this.setState({ first_name: null, last_name: null, email: null, password: null, confirmPassword: null, role: null })
    }
    showModifyUserRole() {
        if (this.state.showModifyUserRole) {
            this.setState({ showModifyUserRole: false })
        }
        else {
            this.setState({ showModifyUserRole: true })
        }
    }
    showLicense(id) {
        this.setState({ openLicensePopup: true, licenseID: id, openAddLicense: false })
        var getLicense = {}
        getLicense['login_user_id'] = this.state.userID
        getLicense['customer_id'] = id
        console.log(getLicense)
        this.setState({ getLicense: getLicense })
        fetch(`http://${this.state.serverIP}:5006/user-management/licenses/get-customer-licenses`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'username': sessionStorage.getItem('username'),
                'Authorization': 'Bearer ' + this.state.loginData.access_token,

            },
            body: JSON.stringify(getLicense)
        })
            .then(resp => resp.json())
            .then(resp => {
                this.setState({ abcd: resp })
                ;
                if (resp.status === 'Customer does not have any licenses') {
                    this.setState({ getLicensePerUser: null })
                    alert('Customer does not have any licenses')

                }
                else {
                    this.setState({ getLicensePerUser: resp })
                }
                console.log(resp, 'getLicensePerUser')
                // this.setState({productName:resp[0].product_name,NumberOfLicense:resp[0].number_of_licenses,productValidity:resp[0].validity})
            })
            .catch((err) => {
                if (err.response) {
                    alert(err.response.data.status)
                    console.log('Error Response Data:', err.response.data);
                    console.log('Error Response Status:', err.response.status);
                    console.log('Error Response Headers:', err.response.headers);
                }
            });
    }
    updateLicense() {
        var license = {}
        license['id'] = this.state.licenseID
        license['product_name'] = this.state.productName
        license['number_of_licenses'] = this.state.NumberOfLicense
        license['validity'] = this.state.productValidity
        license['login_user_id'] = this.state.userID
        console.log(license, "llllllllllllll")
        fetch(`http://${this.state.serverIP}:5006/user-management/licenses/create-update-license`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'username': sessionStorage.getItem('username'),
                'Authorization': 'Bearer ' + this.state.loginData.access_token,
            },
            body: JSON.stringify(license)
        })
            .then(resp => resp.json())
            .then(resp => {
                this.setState({ license_resp: resp })
                ;
                console.log(resp, 'license resp')
                this.setState({ openLicensePopup: false })
                if (resp.status !== 'some of the input parameters are missing') {
                    swal.fire({
                        title: 'Success',
                        text: resp.status,
                        width: 300,
                        height: 40,
                        color: '',
                        icon: 'success',
                    })
                }
                else {
                    swal.fire({
                        title: 'Failed',
                        text: resp.status,
                        width: 300,
                        height: 40,
                        color: '',
                        icon: 'warning',
                    })
                }
                // this.get_users(this.state.loginData);
            })
            .catch((err) => {
                if (err.response) {
                    alert(err.response.data.status)
                    console.log('Error Response Data:', err.response.data);
                    console.log('Error Response Status:', err.response.status);
                    console.log('Error Response Headers:', err.response.headers);
                }
            });
    }
    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber });
    }
    sortTable = (column) => {
        const { sortColumn, sortDirection, usersList } = this.state;
        let direction = 'asc';

        if (sortColumn === column && sortDirection === 'asc') {
            direction = 'desc';
            this.setState({ sortOrder: 'desc' })
        }
        else {
            this.setState({ sortOrder: 'asc' })
        }

        const sortedItems = usersList.sort((a, b) => {
            console.log(usersList, "userrrrr")
            const aValue = a[column].toLowerCase();
            const bValue = b[column].toLowerCase();

            if (aValue < bValue) {
                return direction === 'asc' ? -1 : 1;
            }

            if (aValue > bValue) {
                return direction === 'asc' ? 1 : -1;
            }

            return 0;
        });

        this.setState({
            usersList: sortedItems,
            sortColumn: column,
            sortDirection: direction,
            selectedthSort: column
        });
        var a = this.state.selectedthSort
        console.log(a, 'color')
    };
    filter_alarms() {
        const data = this.state.usersList;
        const severityFilters = this.state.selectedRoleFilters;
        const timestampFilter = this.state.timestamp_Filter;

        let filteredData = data;

        // apply severity filters
        if (severityFilters.length) {
            filteredData = filteredData.filter((item) => {
                return severityFilters.includes(item.role);
            });
        }

        if (timestampFilter.start_time && timestampFilter.stop_time) {
            filteredData = filteredData.filter((item) => {
                const timestamp = new Date(item.date_added);
                return timestamp >= new Date(timestampFilter.start_time) && timestamp <= new Date(timestampFilter.stop_time);
            });
        }
        // set filtered data in state
        this.setState({
            get_filtered_user_info: filteredData,
            openFilterPopup: false
        });
    }
    clearAllfilter() {
        this.setState({ selectedRoleFilters: [] })
        this.setDefaultTime()
        this.setState({ get_filtered_user_info: this.state.usersList })
    }
    exportPDF = (id) => {
        var currentTime = new Date().toLocaleString().replace(/:/g, '-');
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "portrait"; // portrait or landscape
        const marginLeft = 40;
        const doc = new jsPDF(orientation, unit, size);
        doc.setFontSize(15);
        const title = `User List Report (Under ${this.state.userRole})`;
        const headers = [["First Name", "Last Name", "Email", "Role", "Date Added", "Date Modified", "Last Login In Time"]];
        console.log(this.state.pdfData)
        var data = this.state.pdfData.map(elt => [elt.first_name, elt.last_name, elt.email, elt.role, elt.date_added, elt.date_modified, elt.login_time]);

        let content = {
            startY: 50,
            head: headers,
            body: data
        };
        doc.text(title, marginLeft, 40);
        doc.autoTable(content);
        doc.save(`UserReport ${currentTime}.pdf`)
    }
    checkPassword(e) {
        this.setState({ confirmPassword: e.target.value })
    }
    handleChangeModify(e, item) {
        const nameRegex = /^[A-Za-z]+$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (item === 'first') {
            this.setState({ to_update_first_name: e.target.value })
            if (!nameRegex.test(this.state.to_update_first_name)) {
                this.setState({ errormsg: 'First name should only contain characters (letters).' })
            }
            else {
                this.setState({ errormsg: '' })
            }
        }
        else if (item === 'last') {
            this.setState({ to_update_last_name: e.target.value })
            if (!nameRegex.test(this.state.to_update_last_name)) {
                this.setState({ errormsg: 'Last name should only contain characters (letters).' })
            }
            else {
                this.setState({ errormsg: '' })
            }
        }
        else if (item === 'email') {
            this.setState({ to_update_email: e.target.value })
            if (!emailRegex.test(this.state.to_update_email)) {
                this.setState({ errormsg: 'Email should be in format `username@domain.com`' })
            }
            else {
                this.setState({ errormsg: '' })
            }
        }
    }
    handleChange(e, item) {
        const nameRegex = /^[A-Za-z]+$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (item === 'first') {
            this.setState({ first_name: e.target.value })
            if (!nameRegex.test(this.state.first_name)) {
                this.setState({ errormsg: 'First name should only contain characters (letters).' })
            }
            else {
                this.setState({ errormsg: '' })
            }
        }
        else if (item === 'last') {
            this.setState({ last_name: e.target.value })
            if (!nameRegex.test(this.state.last_name)) {
                this.setState({ errormsg: 'Last name should only contain characters (letters).' })
            }
            else {
                this.setState({ errormsg: '' })
            }
        }
        else if (item === 'email') {
            this.setState({ email: e.target.value })
            if (!emailRegex.test(this.state.email)) {
                this.setState({ errormsg: 'Email should be in format `username@domain.com`' })
            }
            else {
                this.setState({ errormsg: '' })
            }
        }
    }
    handlePasswordChange = (e) => {
        const password = e.target.value;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&_()-+={}[;:'"?/.,<>|])[A-Za-z\d@$!%*#?&_()-+={}[;:'"?/.,<>|]{8,}$/;
        const errorMessage = "Password must contain at least one letter, one digit, one special character, and be at least 8 characters long.";
        if (passwordRegex.test(password)) {
            // Password is valid
            this.setState({ password, errorMessage: null });
        } else {
            // Password is invalid
            this.setState({ password, errorMessage });
        }
    };
    toggleDropdown = () => {
        this.setState((prevState) => ({
            isOpen: !prevState.isOpen,
        }));
    };

    updateWithSearchTerm(searchTerm) {
        const { get_user_list } = this.state;


        if (searchTerm === "") {
            this.setState({ get_filtered_user_info: get_user_list });
        } else {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const filteredTable = get_user_list.filter(user => {
                for (const key in user) {
                    if (key === "first_name" || key === "last_name" || key === "email" || key === "role" || key === "date_added" || key === "date_modified" || key === "login_time" || key === "logout_time") {

                        if (
                            typeof user[key] === 'string' &&
                            user[key].toLowerCase().includes(lowerCaseSearchTerm)
                        ) {
                            return true;
                        }
                    }
                }
                return false;
            });
            this.setState({ get_filtered_user_info: filteredTable });
        }
    }
    handleSearch = (e) => {
        var searchTerm = e.target.value;
        this.setState({ searchTerm });
        this.updateWithSearchTerm(searchTerm);
        this.updateCurrentItems();
        console.log(searchTerm)
    }
    updateCurrentItems() {
        const { activePage, itemsPerPage, get_filtered_user_info } = this.state;
        const indexOfLastItem = activePage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = get_filtered_user_info.slice(indexOfFirstItem, indexOfLastItem);
        this.setState({ currentItems: currentItems });
    }

    render() {
        const { isDarkMode ,isToggled} = this.state;
        const lightTheme = createTheme({
        palette: {
            background: {
            default: "#f4f7fe",
            },
            text: {
            primary: "#333",
            },
        },
        });

        const darkTheme = createTheme({
        palette: {
            background: {
            default: "#222",
            },
            text: {
            primary: "#fff",
            },
        },
        });
        const { get_user_list, isOpen } = this.state;
        const { activePage, itemsPerPage, get_filtered_user_info } = this.state;
        const indexOfLastItem = activePage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = get_filtered_user_info.slice(indexOfFirstItem, indexOfLastItem);
        return (

            <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <div
            style={{ height: "100vh" ,overflow:"hidden"}}
            className={isDarkMode ? "dark-mode" : "light-mode"}
            >
            <div
                style={{
                backgroundColor: isDarkMode
                    ? darkTheme.palette.background.default
                    : lightTheme.palette.background.default,
                }}
            >
                <div style={{ display: "flex" }}>
                <div style={{ flex: "4",width:"100%" }}>
                    
                    <NewHeader
                        header_name="Home"
                        path=""
                        darkMode={this.state.isDarkMode}
                        toggleDarkMode={this.toggleDarkMode}
                    />

                        <div className="mainContent" style={{height:"85vh",overflow:"auto"}} >
                       
                       {this.state.is_fetching === true ? <Loading /> : null}
                           <div className="cardDash-wrapper"style={{display: "flex",justifyContent: "space-around",width: "95.5vw",flexWrap: "wrap",gap: "1rem",}}>
                               {this.state.loginData ? (
                                   <div className='cardUser'>
                                       <div style={{ display: 'flex' }}>
                                           <div className='licenceText'>My Profile View</div>
                                           <img alt="" style={{ width: '70px', height: 'auto', marginTop: '5%', marginLeft: '20%' }} src={require('../Images/UserUser.png')}></img>
                                       </div>
                                       <div style={{ display: 'flex' }}>
                                           <div className='licenceKey'>Name:</div>
                                           <div className='licenceValue' style={{ textTransform: 'capitalize', marginLeft: '9%' }}>{this.state.loginData.first_name} {this.state.loginData.last_name}</div>
                                       </div>
                                       <div style={{ display: 'flex' }}>
                                           <div className='licenceKey'>Email:</div>
                                           <div className='licenceValue' style={{ marginLeft: '9%' }}>{this.state.loginData.email}</div>
                                       </div>
                                       <div style={{ display: 'flex' }}>
                                           <div className='licenceKey'>Added:</div>
                                           <div className='licenceValue limit-text' >{this.state.loginData.date_added}</div>
                                       </div>
                                   </div>
                               ) : null}
                               {this.state.loginData ? (
                                   <div className='cardUser'>
                                       {this.state.licenceDetails && !this.state.upgrade ? (
                                           <div>
                                               <div style={{ display: 'flex' }}>
                                                   <div className='licenceText'>License Details</div>
                                                   <img alt="" style={{ width: '70px', height: 'auto', marginTop: '5%', marginLeft: '20%' }} src={require('../Images/UserLicense.png')}></img>
                                               </div>
                                               <div className='licenceKey'>Product:<div className='licenceValue' style={{ textTransform: 'capitalize', marginLeft: '16%' }}>{this.state.licenceDetails.product_name}</div></div>
                                               <div className='licenceKey'>Validity:<div className='licenceValue' style={{ textTransform: 'capitalize', marginLeft: '17%' }}>{this.state.licenceDetails.validity}</div></div>
                                               <div className='licenceKey'>Device Limit:<div className='licenceValue limit-text'>{this.state.licenceDetails.license_devices}</div></div>
                                               {get_user_list ? (<div className='updateLicense' onClick={() => this.setState({ upgrade: true })}>Upgrade License</div>) : null}
                                           </div>
                                       ) : (
                                           <div>
                                               <div style={{ display: 'flex' }}>
                                                   <div className='licenceText'>Upload License</div>
                                                   <img alt="" style={{ width: '70px', height: 'auto', marginTop: '5%', marginLeft: '20%' }} src={require('../Images/UserLicense.png')}></img>
                                               </div>
                                               <div style={{ marginLeft: '3%', marginTop: '-14%' }}><Upload type='userPanel' /></div>
                                               <p style={{ fontSize: 'xx-small', marginLeft: '7%', marginTop: '5%', width: '75%' }}>{this.state.upgrade ? ('Upload a new License to Upgrade') : ('Upload the License to validate the User. You wont be able to perform any operation unless you are validated')}</p>
                                               {this.state.upgrade ? (<div className='updateLicense' onClick={() => this.setState({ upgrade: false })}>View License</div>) : null}
                                           </div>
                                       )}
                                   </div>
                               ) : null}
                               {get_user_list && this.state.countUser ? (
                                   <div className='cardUser'>
                                       <div style={{ display: 'flex' }}>
                                           <div className='licenceText'>{`Total ${get_user_list.length} Users`}</div>
                                           <img alt="" style={{ width: '70px', height: 'auto', marginTop: '5%', marginLeft: '26%' }} src={require('../Images/users.png')}></img>
                                       </div>
                                       <div className='licenceKey' style={{ fontWeight: '400' }}>{`${this.state.countUser[0].length} Network Engineer`}</div>
                                       <div className='licenceKey' style={{ fontWeight: '400' }}>{`${this.state.countUser[1].length} Network Operator`}</div>
                                       <div className='licenceKey' style={{ fontWeight: '400', display: 'flex' }}>{`${this.state.countUser[2].length} Network User`}<div onClick={() => this.showAddNewUserTab()} className='addUser'>Add User</div></div>
                                   </div>
                               ) : null}

                               {get_user_list && this.state.countUser ? (
                                   <div className='cardUser'>
                                       <div style={{ display: 'flex' }}>
                                           <div className='licenceText'>Total 3 Roles</div>
                                           <img alt="" style={{ width: '70px', height: 'auto', marginTop: '5%', marginLeft: '26%' }} src={require('../Images/UserRole.png')}></img>
                                       </div>
                                       <div className='licenceKey' style={{ fontWeight: '400' }}>{`${this.state.countUser[0].length} Network Engineer`}</div>
                                       <div className='licenceKey' style={{ fontWeight: '400' }}>{`${this.state.countUser[1].length} Network Operator`}</div>
                                       <div className='licenceKey' style={{ fontWeight: '400', display: 'flex' }}>{`${this.state.countUser[2].length} Network User`}<div onClick={() => this.showModifyUserRole()} className='addUser'>Edit Role</div></div>
                                   </div>
                               ) : null}
                           </div>

                           {this.state.showAddNewUserTab ? (
                               <div>
                                   <div className='blur-background'></div>
                                   <div className='role_content'>
                                       <img onClick={() => this.setState({ showAddNewUserTab: false })} style={{ position: 'absolute', right: '4%', top: '3%', cursor: 'pointer' }} src={close} alt='' width={10} />
                                       <div className='addUser' style={{ margin: '0px', textAlign: 'center', fontSize: 'medium' }}>Create New User</div>
                                       <div className='underLine' style={{ margin: '0 auto' }}></div>
                                       <div style={{ display: 'flex' }}>
                                           <img style={{ marginTop: '8%', marginLeft: '6%' }} alt={""} src={user_logo} width={200} height={200} />
                                           <div style={{ marginLeft: '7%' }}>
                                               <div style={{ color: 'darkgoldenrod', fontSize: '11px' }}>{this.state.errorMessage}</div>
                                               <div className='new_user_input_fields' style={{ display: 'flex' }}>
                                                   <img style={{ marginTop: '9%', marginRight: '5%' }} alt={""} src={name} width={18} height={18} />
                                                   <TextField placeholder="First Name" type="text" label="First Name" variant="standard" value={this.state.first_name} onChange={(e) => this.handleChange(e, 'first')} />
                                               </div>
                                               <div className='new_user_input_fields' style={{ display: 'flex' }}>
                                                   <img style={{ marginTop: '9%', marginRight: '5%' }} alt={""} src={name} width={18} height={18} />
                                                   <TextField placeholder="Last Name" type="text" label="Last Name" variant="standard" value={this.state.last_name} onChange={(e) => this.handleChange(e, 'last')} />
                                               </div>
                                               <div className='new_user_input_fields' style={{ display: 'flex' }}>
                                                   <img style={{ marginTop: '9%', marginRight: '5%' }} alt={""} src={email} width={18} height={18} />
                                                   <TextField placeholder="Email" type="text" label="Email" variant="standard" value={this.state.email} onChange={(e) => this.handleChange(e, 'email')} />
                                               </div>
                                               <div className='new_user_input_fields' style={{ display: 'flex' }}>
                                                   <img style={{ marginTop: '9%', marginRight: '5%' }} alt={""} src={password} width={18} height={18} />
                                                   <TextField placeholder="Password" type="password" label="Password" variant="standard" value={this.state.password}
                                                       onChange={(e) => this.handlePasswordChange(e)} />
                                               </div>
                                               <div className='new_user_input_fields' style={{ display: 'flex' }}>
                                                   <img style={{ marginTop: '9%', marginRight: '5%' }} alt={''} src={password} width={18} height={18} />
                                                   <TextField placeholder="Password" type="password" label="Confirm Password" variant="standard" value={this.state.confirmPassword}
                                                       onChange={(e) => this.setState({ confirmPassword: e.target.value })} />
                                               </div>
                                               <div className='new_user_input_fields' style={{ display: 'flex' }}>
                                                   <img style={{ marginTop: '9%', marginRight: '5%' }} alt={""} src={role} width={18} height={18} />
                                                   <select className='choose_role_option' value={this.state.role} onChange={(e) => { this.setState({ role: e.target.value }) }} >
                                                       <option hidden>select role</option>
                                                       {this.state.userRole === 'NETWORK-ADMIN' ? (
                                                           <>
                                                               <option>NETWORK-ENGINEER</option>
                                                               <option>NETWORK-OPERATOR</option>
                                                               <option>NETWORK-USER</option>
                                                           </>
                                                       ) : (
                                                           <option>VIEWER</option>
                                                       )}
                                                   </select>
                                               </div>
                                           </div>
                                       </div>
                                       <div style={{ display: 'flex', position: 'relative', marginTop: '3%', marginLeft: '63%' }}>
                                           <button style={{ borderRadius: "3px" }} className='btn btn-primary mb-3' onClick={() => { this.add_user() }}>
                                               Submit
                                           </button>
                                       </div>
                                   </div>
                               </div>
                           ) : null}

                           {this.state.showModifyUserRole ? (
                               <div className='role_content'>
                                   <div className='addUser' style={{ margin: '0px', textAlign: 'center' }}>Change Roles</div>
                                   <img src={close} alt="5%" width="1%" height="1%" style={{ marginLeft: "93.5%", marginTop: "-6%", cursor: 'pointer', width: '12px' }} onClick={(e) => this.setState({ showModifyUserRole: false })} />
                                   <div className='underLine' style={{ margin: '0 auto', marginTop: '-22px' }}></div>
                                   {get_user_list ? (
                                       <div style={{ marginTop: '5%', marginBottom: '2%' }}>
                                           <table className='user_table'>
                                               <thead className='user_table_head'>
                                                   <tr style={{ backgroundColor: '#e5e8ff', color: 'black' }}>
                                                       <th className='thPerf'>Name</th>
                                                       <th className='thPerf'>Network Engineer</th>
                                                       <th className='thPerf'>Network Operator</th>
                                                       <th className='thPerf'>Network User</th>
                                                       <th className='thPerf'></th>
                                                   </tr>
                                               </thead>
                                               <tbody className='tbodyPerf'>
                                                   {get_user_list.map((item) => (
                                                       <tr className='trPerf' key={item._id}>
                                                           <td className='tdPerf'>{`${item.first_name} ${item.last_name}`}</td>
                                                           {['NETWORK-ENGINEER', 'NETWORK-OPERATOR', 'NETWORK-USER'].map((role) => (
                                                               <td className='tdPerf' key={role}>
                                                                   <input
                                                                       type='radio'
                                                                       name={`answer_${item._id}_role`}
                                                                       defaultChecked={item.role === role}
                                                                       value={role}
                                                                       onClick={() => {
                                                                           this.setState({
                                                                               to_update_role: role,
                                                                               to_update_first_name: item.first_name,
                                                                               to_update_last_name: item.last_name,
                                                                               to_update_email: item.email,
                                                                               user_id: item._id
                                                                           });
                                                                       }}
                                                                   />
                                                               </td>
                                                           ))}

                                                           <td className='tdPerf'>
                                                               <button className='confirmRole' style={{ height: '27px', background: '#0d6efd', fontSize: '10px', borderRadius: '3px' }} onClick={() => { this.modify_user(); this.setState({ showModifyUserRole: false }) }}>Modify</button>
                                                           </td>
                                                       </tr>
                                                   ))}
                                               </tbody>
                                           </table>
                                       </div>
                                   ) : null}
                               </div>
                           ) : null}

                           {(this.state.usersList && get_user_list) || this.state.userRole === 'NETWORK-ADMIN' ? (
                               <div style={{ display: 'flex', justifyContent: "flex-end", marginTop: "18px" }}>

                                   <div className='tabbox' style={this.state.showFilter ? { color: '#004f68', fontWeight: 'bold' } : null}
                                       onClick={(e) => this.setState(prevState => ({
                                           openFilterPopup: !prevState.openFilterPopup
                                       }))}
                                   >
                                       <img alt="" className='tabicon' src={require('../Images/filter.png')}></img>
                                       Filter
                                   </div>
                                   <div className='tabbox' onClick={this.toggleDropdown} ref={(ref) => (this.dropdownRef = ref)} >
                                       <img alt="" className='tabicon' src={require('../Images/report.png')}></img>
                                       Report
                                       {isOpen ? (
                                           <div className='downloadOptions' style={{ marginTop: '7%', }}>
                                               <div className='optionsBox' onClick={(e) => { this.setState({ showReportOptions: false }); this.exportPDF(); }}><img alt="" className='tabicon' src={require('../Images/pdf.png')}></img>User PDF List</div>
                                               <div className='optionsBox'>
                                                   {this.state.csvReport ? (
                                                       <CSVLink {...this.state.csvReport}><div className='optionsBox' style={{ color: 'black', textTransform: null }}><img alt="" className='tabicon' src={require('../Images/csv.png')}></img>User CSV List</div></CSVLink>
                                                   ) : <div className='optionsBox' style={{ color: 'black', textTransform: null }}><img alt="" className='tabicon' src={require('../Images/csv.png')}></img>User CSV List</div>}
                                               </div>
                                           </div>
                                       ) : null}
                                   </div>
                                   <div className='tabbox' >
                                       <img onClick={() => this.updateWithSearchTerm(this.state.searchTerm)} alt="" className='tabicon' src={require('../Images/search.png')}></img>
                                       <input
                                           placeholder='Search'
                                           style={{ border: '0', height: '90%', width: '272px', background: "transparent" }}
                                           value={this.state.searchTerm}
                                           onChange={(e) => this.handleSearch(e)}
                                       ></input>
                                   </div>
                               </div>
                           ) : null}

                           {this.state.openFilterPopup ? (
                               <div className="filterpopup" style={{ marginTop: '0.5%',overflowX:'auto' }}>
                                   <div style={{ display: "flex" }}>
                                       <div style={{ color: "rgb(0,79,104)", fontWeight: "bold", marginLeft: "1%" }}>Filter By:</div>
                                       <img src={close} alt="5%" width="1%" height="1%" style={{ marginLeft: "90.5%", marginTop: "1%", cursor: 'pointer' }} onClick={(e) => this.setState({ openFilterPopup: false })} />
                                   </div>

                                   <div style={{ display: "flex" }}>
                                       <div style={{ display: 'flex' }}>
                                           <div>
                                               <div className='filterpopupHeader' style={{ marginLeft: "15%" }}>Role</div>
                                               <div style={{ display: "flex", marginTop: "7%", marginLeft: "15%" }}>
                                                   <div className='severitybutton' style={this.state.selectedRoleFilters.includes('NETWORK-OPERATOR') ? this.state.selectedSeverityFilter : null} onClick={(e) => {
                                                       const filters = [...this.state.selectedRoleFilters];
                                                       const index = filters.indexOf('NETWORK-OPERATOR');
                                                       if (index !== -1) {
                                                           filters.splice(index, 1);
                                                       } else {
                                                           filters.push('NETWORK-OPERATOR');
                                                       }
                                                       this.setState({ selectedRoleFilters: filters });
                                                   }}>NETWORK-OPERATOR</div>
                                                   <div className='severitybutton' style={this.state.selectedRoleFilters.includes('NETWORK-ENGINEER') ? this.state.selectedSeverityFilter : null} onClick={(e) => {
                                                       const filters = [...this.state.selectedRoleFilters];
                                                       const index = filters.indexOf('NETWORK-ENGINEER');
                                                       if (index !== -1) {
                                                           filters.splice(index, 1);
                                                       } else {
                                                           filters.push('NETWORK-ENGINEER');
                                                       }
                                                       this.setState({ selectedRoleFilters: filters });
                                                   }}>NETWORK-ENGINEER</div>
                                                   <div className='severitybutton' style={this.state.selectedRoleFilters.includes('NETWORK-USER') ? this.state.selectedSeverityFilter : null} onClick={(e) => {
                                                       const filters = [...this.state.selectedRoleFilters];
                                                       const index = filters.indexOf('NETWORK-USER');
                                                       if (index !== -1) {
                                                           filters.splice(index, 1);
                                                       } else {
                                                           filters.push('NETWORK-USER');
                                                       }
                                                       this.setState({ selectedRoleFilters: filters });
                                                   }}>NETWORK-USER</div>
                                               </div>
                                           </div>
                                           <div className='vertiline' style={{ marginLeft: "11%" }}></div>
                                       </div>
                                       <div >
                                           <div className='filterpopupHeader' style={{ marginLeft: "6%" }}>Date Added</div>
                                           <div style={{ display: "flex", marginLeft: "6%" }}>
                                               <div>
                                                   <div style={{ fontSize: "small" }}>Select Begin Time:</div>
                                                   <DatePicker
                                                       selected={new Date(this.state.timestamp_Filter.start_time)}
                                                       onChange={(e) => {
                                                           const a = { ...this.state.timestamp_Filter };
                                                           const d = new Date(e);
                                                           a.start_time = this.convertDateFormat(d);
                                                           this.setState({ timestamp_Filter: a, setFlag: true });
                                                       }}
                                                       showTimeSelect
                                                       timeFormat="HH:mm"
                                                       timeIntervals={20}
                                                       timeCaption="time"
                                                       dateFormat="MMMM d, yyyy h:mm aa"
                                                       placeholder="Please select a date"
                                                       className="small-date-time-picker"
                                                   />
                                               </div>
                                               <div style={{ marginLeft: "8%" }}>
                                                   <div style={{ fontSize: "small" }}>Select End Time:</div>
                                                   <DatePicker
                                                       style={{ borderBottom: '0px' }}
                                                       selected={new Date(this.state.timestamp_Filter.stop_time)}
                                                       onChange={(e) => {
                                                           const a = { ...this.state.timestamp_Filter };
                                                           const d = new Date(e);
                                                           a.stop_time = this.convertDateFormat(d);
                                                           console.log(a, "dddddddddddddddd");
                                                           this.setState({ timestamp_Filter: a });
                                                       }}
                                                       showTimeSelect
                                                       timeFormat="HH:mm"
                                                       timeIntervals={20}
                                                       timeCaption="time"
                                                       dateFormat="MMMM d, yyyy h:mm aa"
                                                       placeholder="Please select a date"
                                                       className="small-date-time-picker"
                                                   />
                                               </div>
                                               <div style={{ display: "flex", marginTop: "4%" }}><div className='btn btn-primary mb3 applyAlarmfilter' style={{ background: "grey" }} onClick={(e) => { this.clearAllfilter() }}>Reset</div>
                                                   <div className='btn btn-primary mb3 applyAlarmfilter' onClick={(e) => { this.filter_alarms() }}>Apply</div>
                                               </div>
                                           </div>

                                       </div>
                                   </div>
                               </div>
                           ) : null}

                           {this.state.usersList && this.state.userRole === 'NETWORK-ADMIN' ? (
                               <div>
                                   <table className='user_table' style={{ marginTop: '10px' }}>
                                       <thead className='user_table_head'>
                                           <tr style={{ backgroundColor: '#e5e8ff', color: 'black' }}>
                                               <th onClick={() => this.sortTable("first_name")} style={this.state.selectedthSort && this.state.selectedthSort === "first_name" ? this.state.fixthHead : ({ cursor: 'pointer' })}>First name<img alt="" style={{ marginLeft: '8px', marginTop: '2px' }} src={this.state.selectedthSort === "first_name" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                                               <th onClick={() => this.sortTable("last_name")} style={this.state.selectedthSort && this.state.selectedthSort === "last_name" ? this.state.fixthHead : ({ cursor: 'pointer' })}>Last name<img alt="" style={{ marginLeft: '8px', marginTop: '2px' }} src={this.state.selectedthSort === "last_name" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                                               <th onClick={() => this.sortTable("email")} style={this.state.selectedthSort && this.state.selectedthSort === "email" ? this.state.fixthHead : ({ cursor: 'pointer' })}>Email<img alt="" style={{ marginLeft: '8px', marginTop: '2px' }} src={this.state.selectedthSort === "email" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                                               <th onClick={() => this.sortTable("role")} style={this.state.selectedthSort && this.state.selectedthSort === "role" ? this.state.fixthHead : ({ cursor: 'pointer' })}>Role<img alt="" style={{ marginLeft: '8px', marginTop: '2px' }} src={this.state.selectedthSort === "role" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                                               <th onClick={() => this.sortTable("date_added")} style={this.state.selectedthSort && this.state.selectedthSort === "date_added" ? this.state.fixthHead : ({ cursor: 'pointer' })}>Date added<img alt="" style={{ marginLeft: '8px', marginTop: '2px' }} src={this.state.selectedthSort === "date_added" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                                               <th onClick={() => this.sortTable("date_modified")} style={this.state.selectedthSort && this.state.selectedthSort === "date_modified" ? this.state.fixthHead : ({ cursor: 'pointer' })}>Date Modified<img alt="" style={{ marginLeft: '8px', marginTop: '2px' }} src={this.state.selectedthSort === "date_modified" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                                               <th onClick={() => this.sortTable("login_time")} style={this.state.selectedthSort && this.state.selectedthSort === "login_time" ? this.state.fixthHead : ({ cursor: 'pointer' })}>Last Log In Time<img alt="" style={{ marginLeft: '8px', marginTop: '2px' }} src={this.state.selectedthSort === "login_time" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                                               <th onClick={() => this.sortTable("logout_time")} style={this.state.selectedthSort && this.state.selectedthSort === "logout_time" ? this.state.fixthHead : ({ cursor: 'pointer' })}>Last Log Out Time<img alt="" style={{ marginLeft: '8px', marginTop: '2px' }} src={this.state.selectedthSort === "logout_time" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                                               <th><img src={edit} alt="" width="18" /></th>
                                               <th><img src={garbage} alt="" width="18" /></th>
                                           </tr>
                                       </thead>
                                       <tbody>
                                           {currentItems.map(item => (
                                               <tr>
                                                   <td>{item.first_name}</td>
                                                   <td>{item.last_name}</td>
                                                   <td>{item.email}</td>
                                                   <td>{item.role}</td>
                                                   <td>{item.date_added}</td>
                                                   <td>{item.date_modified}</td>
                                                   <td>{item.login_time}</td>
                                                   <td>{item.logout_time}</td>
                                                   <Tooltip title="Modify" arrow>
                                                       <td onClick={() => this.update_user_tab(item._id, item.first_name, item.last_name, item.email, item.role)}><img src={edit} alt="" width="18" /></td>
                                                   </Tooltip>
                                                   <Tooltip title="Delete" arrow>
                                                       <td onClick={(e) => this.delete_user(e, item._id)}><img src={garbage} alt="" width="18" /></td>
                                                   </Tooltip>
                                               </tr>
                                           ))}
                                       </tbody>
                                   </table>
                                   <Pagination
                                       activePage={activePage}
                                       itemsCountPerPage={itemsPerPage}
                                       totalItemsCount={get_filtered_user_info.length}
                                       pageRangeDisplayed={5}
                                       onChange={this.handlePageChange}
                                       itemClass="page-item"
                                       linkClass="page-link"
                                       hideDisabled
                                       firstPageText="First"
                                       lastPageText="Last"
                                       prevPageText="<<"
                                       nextPageText=">>"
                                       activeClass="active"
                                       activeLinkClass="active-link"
                                       prevPageClassName="page-item"
                                       nextPageClassName="page-item"
                                       prevPageLinkClassName="page-link"
                                       nextPageLinkClassName="page-link"
                                       pageItem={BootstrapPageItem}
                                   />
                               </div>
                           ) : null}

                           {this.state.showUpdateUserTab ? (
                               <div className='role_content' style={{ width: '40%' }}>
                                       <img onClick={() => this.setState({ showUpdateUserTab: false })} style={{ position: 'absolute', right: '6%', top: '4%' }} src={close} alt='' width={10} />
                                       <div className='module_head'>Update User Details:</div>
                                       <div style={{ color: 'darkgoldenrod', fontSize: '11px' }}>{this.state.errormsg}</div>
                                       <div style={{ display: 'flex' }}>
                                           <img style={{ marginTop: '10%', marginLeft: '8%' }} alt={""} src={user_logo} width={170} height={170} />
                                           <div style={{ marginLeft: '10%', marginTop: '4%' }}>
                                               <div style={{ color: 'darkgoldenrod', fontSize: '11px' }}>{this.state.errorMessage}</div>
                                               <div className='new_user_input_fields' style={{ display: 'flex' }}>
                                                   <img style={{ marginTop: '9%', marginRight: '5%' }} alt={""} src={name} width={20} height={20} />
                                                   <TextField placeholder="Name" type="text" label="First Name" variant="standard" value={this.state.to_update_first_name} onChange={(event) => this.handleChangeModify(event, 'first')} />
                                               </div>
                                               <div className='new_user_input_fields' style={{ display: 'flex' }}>
                                                   <img style={{ marginTop: '9%', marginRight: '5%' }} alt={""} src={name} width={20} height={20} />
                                                   <TextField placeholder="Name" type="text" label="Last Name" variant="standard" value={this.state.to_update_last_name} onChange={(event) => this.handleChangeModify(event, 'last')} />
                                               </div>
                                               <div className='new_user_input_fields' style={{ display: 'flex' }}>
                                                   <img style={{ marginTop: '9%', marginRight: '5%' }} alt={""} src={email} width={20} height={20} />
                                                   <TextField placeholder="email" type="text" label="Email" variant="standard" value={this.state.to_update_email} onChange={(event) => this.handleChangeModify(event, 'email')} />
                                               </div>

                                               <div className='new_user_input_fields' style={{ display: 'flex' }}>
                                                   <img style={{ marginTop: '9%', marginRight: '5%' }} alt={""} src={role} width={20} height={20} />
                                                   <select className='choose_role_option' value={this.state.to_update_role} onChange={(event) => { this.setState({ to_update_role: event.target.value }) }}>
                                                       <option hidden>Choose role</option>
                                                       {this.state.userRole === 'NETWORK-ADMIN' ? (
                                                           <React.Fragment>
                                                               <option>NETWORK-ENGINEER</option>
                                                               <option>NETWORK-OPERATOR</option>
                                                               <option>NETWORK-USER</option>
                                                           </React.Fragment>

                                                       ) : (
                                                           <option>VIEWER</option>
                                                       )
                                                       }
                                                   </select>
                                               </div>
                                           </div>
                                       </div>
                                       <div style={{ display: 'flex', position: 'relative', marginTop: '5%', marginLeft: '63%' }}>
                                           <button className='btn btn-primary mb-3' onClick={() => this.modify_user()} >
                                               Submit
                                           </button>
                                       </div>
                               </div>
                           ) : null}

                           {this.state.openLicensePopup ? (
                               <div className='licensePopup'>
                                   <div style={{ display: 'flex' }}>
                                       <div style={this.state.openAddLicense ? (this.state.fade_content) : null} className='module_conf'>
                                           {this.state.getLicensePerUser ? (
                                               <div>
                                                   <div className='module_head'>LICENSE DETAILS:</div>
                                                   {this.state.getLicensePerUser.map((item, index) => (
                                                       <div style={{ marginLeft: '40px' }}>
                                                           <div>License_{index}</div>
                                                           <div style={{ marginLeft: '25px' }}>
                                                               <div className='module_conf'>
                                                                   <h style={{ width: '150px' }}>Product Name</h>
                                                                   <div>: {item.product_name}</div>
                                                               </div>
                                                               <div className='module_conf'>
                                                                   <h style={{ width: '150px' }}>Number of Licenses</h>
                                                                   <div>: {item.number_of_licenses}</div>
                                                               </div>
                                                               <div className='module_conf'>
                                                                   <h style={{ width: '150px' }}>Validity</h>
                                                                   <div >: {item.validity}</div>
                                                               </div>
                                                           </div>
                                                       </div>
                                                   ))}
                                               </div>
                                           ) : (null)}
                                           {this.state.getLicensePerUser ? (
                                               <div>
                                                   <div onClick={() => this.setState({ openAddLicense: true, getLicensePerUser: false })} className='licenseButton' style={{ cursor: "pointer" }}>
                                                       <Tooltip title="Add New License" arrow>
                                                           <img className='add_LicenseButton' src={add} alt=""></img>
                                                       </Tooltip>
                                                   </div>
                                                   <div style={{ marginLeft: '163%', marginTop: '-25px', cursor: 'pointer' }} onClick={() => this.setState({ openLicensePopup: false })} >
                                                       <img style={{ width: '15px' }} src={close} alt="5%" width="1.5%" height="1.5%" />
                                                   </div>
                                               </div>
                                           ) : (
                                               <div onClick={() => this.setState({ openAddLicense: true, getLicensePerUser: false })} className='licenseButton' style={{ left: '89%' }}>
                                                   <Tooltip title="Add New License" arrow>
                                                       <img className='add_LicenseButton' src={add} alt="" ></img>
                                                   </Tooltip>
                                               </div>
                                           )
                                           }

                                       </div>
                                       {this.state.openAddLicense ? (
                                           <div style={{ padding: '10px', width: '200px', marginBottom: '20px' }}>
                                               <div style={{ fontWeight: '700', fontSize: 'small' }}>Enter Details to Add License</div>
                                               <div className='label_module'>
                                                   <label>Product Name</label>
                                                   <input type='text' value={this.state.productName} onChange={(e) => this.setState({ productName: e.target.value })} />
                                               </div>
                                               <div className='label_module'>
                                                   <label>Number of Licenses</label>
                                                   <input type='number' value={this.state.NumberOfLicense} onChange={(e) => this.setState({ NumberOfLicense: e.target.value })} />
                                               </div>
                                               <div className='label_module'>
                                                   <label>Validity PERIOD</label>
                                                   <input type='text' value={this.state.productValidity} onChange={(e) => this.setState({ productValidity: e.target.value })} />
                                               </div>
                                               <div style={{ display: 'flex' }}>
                                                   <button className='cancelRole' style={{ margin: '0 auto', display: 'flex', justifyContent: 'center', marginTop: '10px', marginRight: '1%' }} onClick={() => this.setState({ openLicensePopup: false })}>Cancel</button>
                                                   <button className='confirmRole' style={{ margin: '0 auto', display: 'flex', justifyContent: 'center', marginTop: '10px', width: '50%', marginLeft: '1%' }} onClick={() => this.updateLicense()}>OK</button>
                                               </div>
                                           </div>
                                       ) : null}
                                   </div>
                               </div>
                           ) : null}
                   
                       </div>
                </div>
                </div>
            </div>
            </div>
            </ThemeProvider>

        )
    }
}
export default UserPanel;