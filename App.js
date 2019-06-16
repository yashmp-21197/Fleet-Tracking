import React, { Component } from 'react';
import {
    View,
} from 'react-native';

import Layout from './js/Layout.js';

export default class App extends Component {
    
    constructor(props){
        super(props);
    }
    
    render() {
        return (
            <Layout/>
        );
    }
}