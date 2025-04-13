import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
// Context
import { cardUidContext } from '../contexts/cardUidContext'
import { userContext } from '../contexts/userContext'
// API
import { usersApi } from '../api/supabase/supabaseApi'


const CardReader = ({ setEnableDetectFace }) => { 
    const { cardUID, setCardUID } = useContext(cardUidContext)
    const { user, setUser } = useContext(userContext)
    const [cardData, setCardData] = useState(null);
    const [isReading, setIsReading] = useState(true);
    const [error, setError] = useState(null);

    const readCard = async () => {
        try {
            const response = await axios.get('http://localhost:3002/card/uid', {
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            console.log(response)
            if (response.data) {
                console.log('Card data received:', response.data);
                setCardData(response.data);
                setCardUID(response.data.card_uid);
                console.log('After setCardData');

                if (response.data.status === 'success') {
                    setIsReading(false);
                }
            }
        } catch (error) {
            console.error('Error reading card:', error);
        }
    }; 

    useEffect(() => {
        if (isReading) {
            const interval = setInterval(() => {
                readCard();
            }, 100); 

            return () => clearInterval(interval); // Cleanup on component unmount
        }
        const fetchUserData = async () => {
            if (cardUID != 'noCardUID') {
                    try {
                        const { data, error } = await usersApi.getByCardId(cardData.card_uid);
                        
                        if (error) throw error;
                        setUser(data);

                    } catch (error) {
                        console.error('Error fetching data:', error.message);
                    } finally {
                        setEnableDetectFace(true); // Enable face detection
                    }
                // }
            }
        };

        fetchUserData();
    }, [isReading, cardData]);

    const startReading = () => {
      setIsReading(true);
      setCardData(null);
      
      // readCard()
      // Card reading logic will go here
    };
  
    const stopReading = () => {
      setIsReading(false);
      setCardData(null);
      // Cleanup logic will go here
    };


return (
    <>
      {cardData ? (
          cardData.status === 'error' ? (
              <div>
                  <p>Please, Scan Your Card</p>
              </div>
          ) : (
              <div>
                  <p>UID: {cardData.card_uid}</p>
              </div>
          )
      ) : (
          <div>
              <p>Please, Scan Your Card</p>
          </div>
      )}
    </>
    )
}

export default CardReader