import React, { Component } from 'react';
import {
    View,
    Text,
    Alert,
    AsyncStorage,
} from 'react-native';

import styles from './Styles.js';
import {Strings} from './Strings.js';
import firebase from 'firebase';

import FCM, { FCMEvent , NotificationActionType } from "react-native-fcm";
import { registerKilledListener, registerAppListener } from "./Listeners";
import firebaseClient from "./FirebaseClient";
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';

registerKilledListener();
registerAppListener();

export default class profile extends Component {

    constructor(props){
        super(props);
        this.state = {
            username : this.props.parentstate.username,
            driverkey : this.props.parentstate.driverkey,
            vehiclekey : this.props.parentstate.vehiclekey,
            pushinterval : this.props.parentstate.pushinterval,
            driver_list : this.props.parentstate.driver_list,
            vehiclename : "",
        };
        this.initprofile();
    }
    
    async initprofile(){
        
        BackgroundGeolocation.start(() => {
            console.log('start background geolocation');
        });
        
        BackgroundGeolocation.configure({
            desiredAccuracy: 10,
            stationaryRadius: 50,
            distanceFilter: 50,
            locationTimeout: 30,
            startForeground: false,
            debug: false,
            startOnBoot: true,
            stopOnTerminate: false,
            locationProvider: BackgroundGeolocation.provider.ANDROID_ACTIVITY_PROVIDER,
            interval: 2000,
            fastestInterval: 2000,
            activitiesInterval: 2000,
            stopOnStillActivity: false,
        });
        
        firebase.database().ref('Registered/'+this.state.username.substring(1)+'/driverlist/'+this.state.driverkey+'/assign')
            .off();
        firebase.database().ref('Registered/'+this.state.username.substring(1)+'/driverlist/'+this.state.driverkey+'/assign')
            .on('value' , this.refreshvehiclekey.bind(this));
        
        firebase.database().ref('Registered/'+this.state.username.substring(1)+'/driverlist')
            .on('child_removed', (remove_snap)=>{
            if(remove_snap.key == this.state.driverkey){
                firebase.database()
                    .ref('Registered/'+this.state.username.substring(1)+'/driverlist/'+this.state.driverkey+'/assign')
                    .off();
                firebase.database()
                    .ref('/Registered'+this.state.username.substring(1)+'/vehiclelist'+this.state.vehiclekey+'/interval')
                    .off();
                firebase.database()
                    .ref('Registered/'+this.state.username.substring(1)+'/driverlist')
                    .off();
                this.removeData();
            }
        });
        
        FCM.requestPermissions()
            .then(()=>{
            console.log('Notification permission is granted');
        })
            .catch(()=>{
            Alert.alert('Alert.','Notification permission is not granted');
        });
        FCM.getFCMToken().then(token => {
            console.log(JSON.stringify(token));
            firebase.database().ref('/Registered/'+this.state.username.substring(1)+'/driverlist/'+this.state.driverkey+'/token')
                .set(token);
        });
        FCM.getInitialNotification().then(notif => {
            console.log(JSON.stringify(notif));
        });
    }
    
    removeData = () => {
        this.props.changeParentState({
            login_state : false,
            driver_state : false,
            username : "",
            pswd : "",
            driverkey : "",
            vehiclekey : "",
            pushinterval : -1,
            driver_list : [],
        });
    }
    
    refreshvehiclekey = (ref_val) => {
        
        if(ref_val.val() == null){
            firebase.database()
                .ref('/Registered/'+this.state.username.substring(1)+'/driverlist/'+this.state.driverkey+'/assign')
                .off();
            this.removeData();
            return;
        }
        
        let new_list = this.state.driver_list;
        new_list[this.state.driverkey].assign = ref_val.val();
        firebase.database().ref('/Registered/'+this.state.username.substring(1)+'/vehiclelist/'+this.state.vehiclekey+'/interval')
            .off();
        
        //can change with licence
        
        firebase.database()
            .ref('/Registered/'+this.state.username.substring(1)+'/vehiclelist/'+ref_val.val()+'/name')
            .once('value' , (name_snap)=>{
            
            this.setState({
                vehiclekey : ref_val.val(),
                driver_list : new_list,
                vehiclename : name_snap.val()
            },()=>{
                this.props.changeParentState({
                    vehiclekey : this.state.vehiclekey,
                    driver_list : this.state.driver_list,
                });
                this.getInterval();
            });
        });
    }
    
    getInterval = () => {
        firebase.database()
            .ref('/Registered/'+this.state.username.substring(1)+'/vehiclelist/'+this.state.vehiclekey+'/interval')
            .on('value', (ref_val) => {
            this.setState({
                pushinterval : ref_val.val(),
            },()=>{
                this.props.changeParentState({
                    pushinterval : this.state.pushinterval,
                });
            });
        });
    }
    
    render() {
        return (
            <View style={styles.view3}>
                <View style={styles.pro}>
                    <Text style={[styles.profiledesign]}>{Strings.drivername_str} : {this.props.parentstate.driver_list[this.props.parentstate.driverkey].name}</Text>
                </View>
                <View style={styles.pro}>
                    <Text style={[styles.profiledesign]}>{Strings.assignvehiclekey_str} : {this.props.parentstate.driver_list[this.props.parentstate.driverkey].assign}</Text>
                </View>
                <View style={styles.pro}>
                    <Text style={[styles.profiledesign]}>{Strings.assignvehiclename_str} : {this.state.vehiclename}</Text>
                </View>
                <View style={styles.pro}>
                    <Text style={[styles.profiledesign]}>{Strings.pushinterval_str} : {(this.props.parentstate.pushinterval/1000).toString()} sec</Text>
                </View>
            </View>
        );
    }
}