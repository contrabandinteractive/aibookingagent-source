import { useNylas } from '@nylas/nylas-react';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import IconDelete from './components/icons/IconDelete.jsx';
import DatePicker from "react-datepicker";
import axios from 'axios';

import "react-datepicker/dist/react-datepicker.css";




function SendEmails({ userId, setToastNotification, style }) {
  const nylas = useNylas();

  const [to, setTo] = useState('booking@resoundpresents.com');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedCity, setSelectedCity] = useState('Austin');
  const [bandName,setBandName] = useState('');
  const [description,setDescription] = useState('');
  const [epkLink,setEPKLink] = useState('');
  const [venueName,setVenueName] = useState('Empire Control Room');
  const [preferredDate,setPreferredDate] = useState(new Date()); 
  const [firstRender, setFirstRender] = useState(false);


  const [options, setOptions] = useState([
    { value: '', label: '' }
  ]);



  async function getFirstList()  {
    const { data } = await axios.get("https://contrabandinteractive.com/tests/venues-api/?source=https://contrabandinteractive.com/tests/venues-api/venues-tx.csv&State=TX&City=Austin");
    const results = [];
    const namesArray = Object.values(data).map(item => item.Name);
    namesArray.forEach((value) => {
      results.push({
        value: value,
        label: value,
      });
    });
    console.log(results);
    setOptions(results);
  }
 


  useEffect(() => {
    if (!firstRender) {
      console.log("initialized!");
      getFirstList();
      setFirstRender(true);
    }
  }, [firstRender]);







  async function changeOptions(theCityToGet)  {
    const { data } = await axios.get("https://contrabandinteractive.com/tests/venues-api/?source=https://contrabandinteractive.com/tests/venues-api/venues-tx.csv&State=TX&City="+theCityToGet);
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

  async function setTheToValue(selectedVenueToGet){
    const { data } = await axios.get("https://contrabandinteractive.com/tests/venues-api/?source=https://contrabandinteractive.com/tests/venues-api/venues-tx.csv&Name="+selectedVenueToGet);
    console.log('The venue email');
    const firstKey = Object.keys(data)[0];
    const theEmailAddy = data[firstKey].Email; 
    console.log(theEmailAddy);
    setTo(theEmailAddy);
  }

  //const [selected, setSelected] = useState(options[0].value);
  

  const handleChange = event => {
    console.log(event.target.value);
    document.getElementById('toAddress').value= event.target.value;
    setVenueName(event.target.value);

    // Add the "To" email
    setTheToValue(event.target.value);

  };

  const changeCities = event => {
    console.log(event.target.value);
    setSelectedCity(event.target.value);
    changeOptions(event.target.value);
    setTo('');
  };




  const clearEmail = () => {
    setTo('');
    setSubject('');
    setBody('');
  };

  const sendEmail = async ({ userId, to, body }) => {
    let formattedDate = preferredDate.toISOString().slice(0, 10);
    console.log(formattedDate);
    
    try {
      const url = nylas.serverBaseUrl + '/nylas/send-email';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: userId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, body, venueName, formattedDate, preferredDate }),
      });

      if (!res.ok) {
        setToastNotification('error');
        throw new Error(res.statusText);
      }

      const data = await res.json();
      setToastNotification('success');

      return data;
    } catch (error) {
      console.warn(`Error sending emails:`, error);
      setToastNotification('error');

      return false;
    }
    
  };



  const generateTheEmail = async ({ userId, to, body }) => {

    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const newDateObj = new Date(preferredDate);
    const englishDate = newDateObj.toLocaleDateString('en-US', options);

   
    setIsGenerating(true);
    let formattedDate = preferredDate.toISOString().slice(0, 10);
    setSubject('Booking Inquiry: '+bandName+' on '+englishDate);
    setBody('AI Booking agent is creating your email. Please wait just a moment...');

    try {
      const url = nylas.serverBaseUrl + '/nylas/generateAIEmail';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: userId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bandName, venueName, preferredDate, description, epkLink }),
      });

      if (!res.ok) {
        setToastNotification('error');
        throw new Error(res.statusText);
      }

      const data = await res.json();
      //setToastNotification('success');
      console.log("Return data 2644: "+data.theAIResponse[0].message.content);
      setBody(data.theAIResponse[0].message.content);
      setIsGenerating(false);

      return data;
      
    } catch (error) {
      console.warn(`Error generating email body:`, error);
      setToastNotification('error');
      setBody('');
      setIsGenerating(false);

      return false;
    }

    
    
    
    
  };



  const send = async (e) => {
    e.preventDefault();

    if (!userId) {
      return;
    }
    setIsSending(true);
    const message = await sendEmail({ userId, to, body });
    console.log('message sent', message);
    clearEmail();
    setIsSending(false);
  };

  return (
    <>
    <div className="venueSelect">
      <label className="input-label" htmlFor="Your Band Name">
              Artist Name: 
            </label>
            <input
              aria-label="Your Band Name"
              id="thebandname"
              value={bandName}
              onChange={(e) => setBandName(e.target.value)}
        />
        <label className="input-label" htmlFor="Description">
              Description/details: 
            </label>
            <input
              aria-label="Description"
              id="thebanddesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
        />
        <label className="input-label" htmlFor="EPK Link">
              EPK Link: 
            </label>
            <input
              aria-label="EPK Link"
              id="epklink"
              value={epkLink} 
              onChange={(e) => setEPKLink(e.target.value)}
        />
        <div id="datepickerarea">
        <p>Choose requested date: </p>
        <DatePicker class="thedatepicker" selected={preferredDate} onChange={(date) => setPreferredDate(date)} />   
          <p></p> 
        </div>

        <div className="apiselectboxes">
        <p>Use our Venues API to select a venue. If an email is found for the venue, it'll automatically populate the "To" field.</p>
        <div className="venueSelectState">
          <p>State</p>
          <select>
            <option value="someOption" selected>TX</option>
          </select>
        </div>
        <div className="venueSelectCity">
          <p>City</p>
          <select name="venueCitiesList" onChange={changeCities}>
              <option value="Austin">Austin</option>
              <option value="Dallas">Dallas</option>
          </select>
        </div>
        <div className="venueSelectVenue">
          <p>Venue</p>

          <select onChange={handleChange}>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

        </div>
        </div>

      </div>
    <form onSubmit={send} className={`email-compose-view ${style}`}>
      
      <button
          className={`primary ${style}`}
          type="button"
          id="generateTheEmailBtn"
          onClick={generateTheEmail}
        >
          {isGenerating ? 'Generating...please wait' : 'Generate Email'}
      </button>
      <div className="input-container">
        <label className="input-label" htmlFor="To">
          To: 
        </label>
        <input
          aria-label="To"
          id="toAddress"
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        {!style && (
          <>
            <div className="line"></div>

            <label className="input-label" htmlFor="Subject">
              Subject: 
            </label>
            <input
              id="theEmailSubject"
              aria-label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <div className="line"></div>
          </>
        )}
      </div>
      <textarea
        className="message-body"
        aria-label="Message body"
        placeholder="Email body..."
        rows={style === 'small' ? 3 : 20}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <div className="composer-button-group">
        
        <button
          className={`primary ${style}`}
          disabled={!to || !body || isSending}
          type="submit"
        >
          {isSending ? 'Sending...' : 'Send email'}
        </button>
        
        <button className="icon" type="button" onClick={clearEmail}>
          <IconDelete />
          Clear email
        </button>
      </div>
      
      <p id="smallnote">When you send the email, a calendar event will also be created on your primary calendar to hold the date.</p>
    </form>
    </>
  );
}

SendEmails.propTypes = {
  style: PropTypes.string,
  userId: PropTypes.string.isRequired,
  setToastNotification: PropTypes.func.isRequired,
};

export default SendEmails;
