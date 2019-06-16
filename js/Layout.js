import React, { Component } from 'react';
import {
    View,
    AsyncStorage
    } from 'react-native';

import styles from './Styles.js';
import Login from './Login.js';
import Driverlist from './Driverlist.js';
import Profile from './Profile.js';
import firebase from 'firebase';

const config = {
    apiKey: "AIzaSyDZiarvhBiFUQQBt7_jyQYvuHtzemc7iUk",
    authDomain: "fleet-track-2018.firebaseapp.com",
    databaseURL: "https://fleet-track-2018.firebaseio.com",
    projectId: "fleet-track-2018",
    storageBucket: "fleet-track-2018.appspot.com",
    messagingSenderId: "803513680370"
};
firebase.initializeApp(config);

export default class Layout extends Component {
    
    constructor(props){
        super(props);        
        this.state ={
            login_state : false,
            driver_state : false,
            username : "",
            pswd : "",
            driver_list : [],
            driverkey : "",
            vehiclekey : "",
            pushinterval : null,
        };
//        AsyncStorage.setItem('login_state', false.toString());
//        AsyncStorage.setItem('driver_state', false.toString());
//        AsyncStorage.setItem('username', "");
//        AsyncStorage.setItem('pswd', "");
//        AsyncStorage.setItem('driverkey', "");
//        AsyncStorage.setItem('vehiclekey', "");
//        AsyncStorage.setItem('pushinterval', (-1).toString());
//        AsyncStorage.setItem('driver_list', JSON.stringify(this.state.driver_list[this.state.driverkey]));
//        AsyncStorage.setItem('running_state','false');
        this.getStoredData();
    }
    
    async getStoredData(){
		
        const value1 = await AsyncStorage.getItem('login_state');
        const value2 = await AsyncStorage.getItem('driver_state');
        const value3 = await AsyncStorage.getItem('username');
        const value4 = await AsyncStorage.getItem('pswd');
        const value5 = await AsyncStorage.getItem('driverkey');
        const value6 = await AsyncStorage.getItem('driver_list');
        const value7 = await AsyncStorage.getItem('vehiclekey');
        const value8 = await AsyncStorage.getItem('pushinterval');
        
        var login_state_value = (value1 === 'true') ? true : false;
        var driver_state_value = (value2 === 'true') ? true : false;
        var username_value = value3;
        var pswd_value = value4;
        var driverkey_value = value5;
        var tempdata = JSON.parse(value6);
        var driver_list_value = [];
        driver_list_value[driverkey_value] = tempdata;
        var vehiclekey_value = value7;
        if(driver_list_value[driverkey_value] !== null){
            driver_list_value[driverkey_value].assign = vehiclekey_value;
        }
        var pushinterval_value = parseInt(value8,10);
        this.setState({
            login_state: login_state_value,
            driver_state: driver_state_value,
            username: username_value,
            pswd: pswd_value,
            driverkey: driverkey_value,
            vehiclekey: vehiclekey_value,
            pushinterval: pushinterval_value,
            driver_list: driver_list_value,
        });
    }
    
    getCurrentLocationData = (username) => {
        
        var date_obj = new Date();
        var day = date_obj.getDate().toString();
        var month = (date_obj.getMonth() + 1).toString();
        var year = date_obj.getFullYear().toString();
        
        if(day.length==1){
            day = "0"+day;
        }
        if(month.length==1){
            month = "0"+month;
        }
        var date=year+'-'+month+'-'+day;
        
        firebase.database()
            .ref('/Registered/'+username+'/vehiclelist')
            .once('value' , (vehicle_snap) => {
            vehicle_snap.forEach((child_snap)=>{
                var vehiclekey = child_snap.key;
                firebase.database()
                    .ref('/locations/'+vehiclekey+"/"+date)
                    .on('child_added' , (loc_snap)=>{
                    var loc_val = loc_snap.val();
                    var loc_key = loc_snap.key;
                    var obj = {
                        'vehiclekey' : vehiclekey,
                        'location' : {
                            loc_key : loc_val
                        }
                    };
                    var loc_data = JSON.stringify(obj);
                    //return loc_data
                });
            });
        });        
    }
    
    changeState(val){
        this.setState(val,() => {
            AsyncStorage.setItem('login_state', this.state.login_state.toString());
            AsyncStorage.setItem('driver_state', this.state.driver_state.toString());
            AsyncStorage.setItem('username', this.state.username);
            AsyncStorage.setItem('pswd', this.state.pswd);
            AsyncStorage.setItem('driverkey', this.state.driverkey);
            AsyncStorage.setItem('vehiclekey', this.state.vehiclekey);
            AsyncStorage.setItem('pushinterval', this.state.pushinterval.toString());
            AsyncStorage.setItem('driver_list', JSON.stringify(this.state.driver_list[this.state.driverkey]));
        });
    }

    render() {
        
        let ref = null;
        
        if(!this.state.login_state && !this.state.driver_state){
            ref = <Login changeParentState={this.changeState.bind(this)} parentstate={this.state} />
        }else if(this.state.login_state && !this.state.driver_state){
            ref = <Driverlist changeParentState={this.changeState.bind(this)} parentstate={this.state} />
        }else if(this.state.login_state && this.state.driver_state){
            ref = <Profile changeParentState={this.changeState.bind(this)} parentstate={this.state} />
        }
        
        return (
            <View style={styles.mainview}>
                {ref}
            </View>
        );
    }
}