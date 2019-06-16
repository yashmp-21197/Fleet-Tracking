import React, { Component } from 'react';
import {
    View,
    Text,
    Alert,
    TouchableHighlight,
    ScrollView,
    ListView,
} from 'react-native';

import styles from './Styles.js';
import {Strings} from './Strings.js';
import firebase from 'firebase';

export default class driverlist extends Component {
    
    constructor(props){
        super(props);
        
        this.dataSource = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2,
        });
        this.state = {
            login_state : this.props.parentstate.login_state,
            driver_state : this.props.parentstate.driver_state,
            username : this.props.parentstate.username,
            driver_list : [],
            dataSource : this.dataSource.cloneWithRows([]),
            driverkey : this.props.parentstate.driverkey,
            vehiclekey : this.props.parentstate.vehiclekey,
        };
        this.fetchdriverlist();
    }

    async fetchdriverlist(){        
        firebase.database().ref('/Registered/'+this.state.username.substring(1)+'/driverlist').on('child_added',(list_snap) => {
            var driver = list_snap.val();
            var key = list_snap.key;
            var list = this.state.driver_list;
            driver['key'] = key;
            list[key] = driver;
            this.setState({
                driver_list: list,
                dataSource: this.dataSource.cloneWithRows(list)
            });
        });
    }

    pressRow = (record) => {
        
        firebase.database()
            .ref('/Registered/'+this.state.username.substring(1)+'/driverlist/'+record.key+'/active')
            .once('value' , (active_snap)=>{
            var status = (active_snap.val() == 1) ? true : false;
            
            if(!status){
                Alert.alert(
                    Strings.alert13_str,
                    Strings.alert14_str+record.name,
                    [
                        {text: 'Ok', onPress: () => {
                            firebase.database()
                                .ref('/Registered/'+this.state.username.substring(1)+'/driverlist')
                                .off('child_added');
                            firebase.database()
                                .ref('/Registered/'+this.state.username.substring(1)+'/driverlist/'+record.key+'/active')
                                .set(1);
                            let driverkey = record.key;
                            let new_driver_list = [];
                            new_driver_list[driverkey] = record;
                            this.setState({
                                driver_state : true, 
                                driverkey : driverkey, 
                                driver_list : new_driver_list
                            }, () => {
                                this.props.changeParentState(this.state);
                            });
                        }},
                    ],
                );
            }else{
                Alert.alert(
                    Strings.alert15_str,
                    Strings.alert16_str
                );
            } 
        });
    }
    
    renderRow(record) {
        return (
            <View>
                <TouchableHighlight onPress={() => this.pressRow(record)}>
                    <View style={styles.driverlistdesign}>
                        <Text style={styles.listtextcolor}>{record.name}</Text>
                    </View>
                </TouchableHighlight>
            </View>
        );
    }
    
    render() {
        return (
            <View style={styles.view2}>
                <ScrollView scrollsToTop={true}>
                    <ListView
                        dataSource={this.state.dataSource}
                        renderRow={this.renderRow.bind(this)}
                    />
                </ScrollView>
            </View>
        );
    }
}