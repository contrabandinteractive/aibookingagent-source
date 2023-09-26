import React from 'react';
import PropTypes from 'prop-types';
import SendEmails from './SendEmails';
import './styles/email.scss';
import { useState, useEffect } from 'react';
import axios from 'axios';

function EmailApp({ userId, setToastNotification }) {
  /*
  const [selectedCity, setSelectedCity] = useState('Burlington');
  const [bandName,setBandName] = useState('');

  const [options, setOptions] = useState([
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
  ]);

  async function changeOptions(theCityToGet)  {
    const { data } = await axios.get("https://contrabandinteractive.com/tests/venues-api/?source=https://contrabandinteractive.com/tests/venues-api/venues.csv&State=VT&City="+theCityToGet);
    const results = [];
    //const data2 = JSON.parse(data);

    const namesArray = Object.values(data).map(item => item.Name);
    //console.log(namesArray);

    
    namesArray.forEach((value) => {
      results.push({
        value: value,
        label: value,
      });
    });
    console.log(results);
    // Update the options state
    setOptions(results);

  }

  //const [selected, setSelected] = useState(options[0].value);
  

  const handleChange = event => {
    console.log(event.target.value);
    document.getElementById('toAddress').value= event.target.value;
    //setSelected(event.target.value);
  };

  const changeCities = event => {
    console.log(event.target.value);
    setSelectedCity(event.target.value);
    changeOptions(event.target.value);
  };

  /*
  useEffect(() => {
    async function fetchData() {
      // Fetch data
      const { data } = await axios.get("https://contrabandinteractive.com/tests/venues-api/?source=https://contrabandinteractive.com/tests/venues-api/venues.csv&State=VT&City="+selectedCity);
      const results = []
      // Store results in the results array
      data.forEach((value) => {
        results.push({
          key: value.name,
          value: value.id,
        });
      });
      // Update the options state
      setOptions([
        {key: 'Select a venue', value: ''}, 
        ...results
      ])
    }

    // Trigger the fetch
    fetchData();
  }, []);
  */
  

  return (
    <>
      
      <div className="email-app">
        <SendEmails
          userId={userId}
          setToastNotification={setToastNotification}
        />
      </div>
      <div className="mobile-warning hidden-desktop">
        <h2>
          The AI Booking Agent demo is currently designed for a desktop experience.
        </h2>

      </div>
    </>
  );
}

EmailApp.propTypes = {
  userId: PropTypes.string.isRequired,
  setToastNotification: PropTypes.func.isRequired,
};

export default EmailApp;
