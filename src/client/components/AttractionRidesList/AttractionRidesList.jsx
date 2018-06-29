import React, { Component } from 'react';
import AttractionRideListItem from '../AttractionRideListItem/AttractionRideListItem.jsx';
import PropTypes from 'prop-types';
import { Grid, Button } from 'react-bootstrap';
import axios from 'axios';
import { PulseLoader } from 'react-spinners';
import styles from './AttractionRidesList.scss';
import moment from 'moment';

const Datetime = require('react-datetime');

class AttractionRidesList extends Component {

    constructor(props) {
        super(props);

        this.renderAttractionListItems = this.renderAttractionListItems.bind(this);
        this.getUserLocation = this.getUserLocation.bind(this);
        this.setDateTimeToNow = this.setDateTimeToNow.bind(this);
        this.updateDateTime = this.updateDateTime.bind(this);

        //explicitly bind hoisted functions to this on lexical scope.
        this.state = {
            attractions: [],
            loading: true,
            pickupDateTime: moment(),
            isOnDemand: true, //defaul to onDemand
        };
    }

    getUserLocation() {
        var userCity = ''; //todo: STOP HARD CODING.

        var options = {
            enableHighAccuracy: true,
            fallbackToIP: true, // fallback to IP if Geolocation fails or rejected
            addressLookup: true
        };

        geolocator.config({
            language: "en",
            google: {
                version: "3",
                key: "AIzaSyC48NfaeD0nF8CmKFJ2aFCa1ZN-I6ZeQKI"
            }
        });

        geolocator.locate(options, function (err, location) {
            userCity = location.address.city;

            //Make the inital request to get the list of attractions here
            axios.get(`http://localhost:8080/attractions/${userCity}`)
                .then((response) => {
                    // Parse the resopnse into an array and update the state.
                    this.setState({
                        userLocation: location,
                        attractions: response.data,
                        loading: false,
                    });
                });
        }.bind(this));
    }

    componentDidMount() {
        // this.getUserLocation();

        navigator.geolocation.getCurrentPosition((position) => {
            //Make the inital request to get the list of attractions here
            axios.get(`http://localhost:8080/attractions?lat=${position.coords.latitude}&lng=${position.coords.longitude}`)
                .then((response) => {
                    // Parse the resopnse into an array and update the state.
                    this.setState({
                        userLocation: position,
                        attractions: response.data,
                        loading: false,
                    });
                });
        });
    }

    setDateTimeToNow() {
        console.log('setting date time to now.');

        //set this to now
        var now = moment();

        this.setState({
            pickupDateTime: now,
            isOnDemand: true,
        });
    }

    updateDateTime(datetime) {
        debugger;

        console.log('updateing date time');

        this.setState({
            pickupDateTime: datetime,
            isOnDemand: false,
        });
    }

    renderAttractionListItems() {
        return this.state.attractions.map((currentAttraction, index) => {
            console.log(`current attraction: ${currentAttraction.name} dropoff lat: ${currentAttraction.geometry.location.lat}, dropoff long: ${currentAttraction.geometry.location.lng}`);
            return (
                <AttractionRideListItem
                    key={`rw-booking-hack__attraction-${index}`}
                    {...currentAttraction}
                    pickupLocation={
                        {
                            lat: this.state.userLocation.coords.latitude,
                            long: this.state.userLocation.coords.longitude,
                        }
                    }
                    dropoffLocation={
                        {
                            lat: currentAttraction.geometry.location.lat,
                            long: currentAttraction.geometry.location.lng,
                        }
                    }
                    prebookPickupTime={this.state.pickupDateTime}
                    isOnDemand={this.state.isOnDemand}
                />
            )
        });
    }

    render() {
        return this.state.loading === false ?
            <div>
                <div className='rw-booking-hack__date-time-picker-pre-book'>
                    <span>Choose a pickup time: </span>
                    <Datetime value={this.state.pickupDateTime} onChange={this.updateDateTime} />
                    <Button bsStyle='primary' onClick={this.setDateTimeToNow}>Go Now</Button>
                </div>
                <Grid>{this.renderAttractionListItems()}</Grid>
            </div> :
            <div className='rw-booking-hack__loader'>
                <PulseLoader
                    color={'#003580'}
                    loading={this.state.loading}
                />
            </div>
    }
}

module.exports = AttractionRidesList;