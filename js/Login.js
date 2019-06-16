import React, { Component } from 'react';
import {
    View,
    Image,
    TextInput,
    Text,
    Alert,
    TouchableOpacity,
    KeyboardAvoidingView,
} from 'react-native';

import styles from './Styles.js';
import {Strings} from './Strings.js';
import firebase from 'firebase';

export default class login extends Component {
    
    constructor(props){
        super(props);
        this.state = {
            login_state : this.props.parentstate.login_state,
            username : this.props.parentstate.username,
            pswd : this.props.parentstate.pswd,
        };
    }
    
    logInToSystem = () => {
        
        let number = this.state.username;
        let pattern1 = /^[\+]\d{2}[\-]\d{10}$/;
        let pattern2 = /^[\+]\d{3}[\-]\d{10}$/;
        
        if(!pattern1.test(number) && !pattern2.test(number)){
            Alert.alert(
                Strings.alert1_str,
                Strings.alert2_str,
                [
                    {text: Strings.ok, onPress: () => {this.setState({username:"", pswd:""});}},
                ]
            );
        }else if(this.state.pswd.length == 0){
            Alert.alert(
                Strings.alert3_str,
                Strings.alert4_str
            );
        }else{
            this.fatchlogindata();
        }
    }
    
    async fatchlogindata(){
        
        firebase.database().ref('/Registered/'+this.state.username.substring(1)+'/pswd').once('value' , (ref_val) => {
            const jsonData = ref_val.val();
            if(jsonData == null){
                Alert.alert(
                    Strings.alert5_str,
                    Strings.alert6_str
                );
                this.setState({username:"", pswd:""});
            }else if(jsonData === this.state.pswd){
                this.setState({login_state: true}, () => {
                    this.props.changeParentState(this.state);
                });
            }else{
                Alert.alert(
                    Strings.alert7_str,
                    Strings.alert8_str
                );
                this.setState({pswd:""});
            }
        });        
    }

    render() {
        return (
            <KeyboardAvoidingView behaviour="padding" style={styles.view1}>
                <View style={styles.logoContainer}>
                    <Image
                        style={styles.logo}
                        source={require('../src/fleet-track-logo-png-transparent.png')}
                    />
                </View>
                <View style={styles.container}>
                    <TextInput 
                        placeholder={Strings.username_str}
                        placeholderTextColor="#FFF"
                        onChangeText={(text) => {
                                        this.setState({username: text});
                                }}
                        value={this.state.username}
                        returnKeyType="next"
                        autoCorrect={false}
                        style={styles.input}
                    />
                    <TextInput 
                        placeholder={Strings.password_str}
                        placeholderTextColor="#FFF"
                        secureTextEntry={true} 
                        onChangeText={(text) => {
                                        this.setState({pswd: text});
                                }}
                        value={this.state.pswd}
                        returnKeyType="go"
                        style={styles.input}
                    />
                    <TouchableOpacity style={styles.buttonContainer}
                        onPress={this.logInToSystem}
                    ><Text style={styles.buttonText}>{Strings.login_str}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        );
    }
}