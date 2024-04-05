import React, { useState, useEffect } from 'react';
import notificationSound from './assets/notification.mp3';

export const SubscribeToEvents = () => {
  const [notificationStack, setNotificationStack] = useState([]);
  const audio = new Audio(notificationSound); 

  useEffect(() => {
    const ruleSource = new EventSource(`http://${process.env.REACT_APP_CLIENT_IP}:5007/rule-engine/rule-stream`);
    const eventSource = new EventSource(`http://${process.env.REACT_APP_CLIENT_IP}:5000/configuration-management/notif-stream`);

    const handleEvent = (eventStream) => {
      let newNotification;
      if(eventStream.rule){
        newNotification = { heading: "Policy Execution", notifContent: `${eventStream.rule} has been triggered`};
        setNotificationStack((prevStack) => [newNotification, ...prevStack]);
        audio.play();
      }
      if (eventStream["@xmlns"]) {
        console.log(eventStream, 'inside');
        for (let key in eventStream) {
          if (key !== "@xmlns" && key !== "eventTime") {
            console.log(eventStream[key], 'cdhcdgchgdschgdscfdshgcdvsbcdsv');
            let newNotification = { heading: key, notifContent: {} };
            for (let prop in eventStream[key]) {
              if (prop !== "@xmlns") {
                newNotification.notifContent[prop] = eventStream[key][prop];
              }
            }
            newNotification.notifContent = JSON.stringify(newNotification.notifContent, null, 2);
            setNotificationStack((prevStack) => [newNotification, ...prevStack]);
            audio.play();
          }
        }
      }
      
    };

    eventSource.onmessage = function (event) {
      if(event.data!=="Starting stream..."){
        const notifEventStream = JSON.parse(event.data.replace(/'/g, '"'));
        handleEvent(notifEventStream); 
      }
      
    };

    ruleSource.onmessage = function (event) {
      if(event.data!=="Starting stream..."){
        const ruleEventStream = JSON.parse(event.data.replace(/'/g, '"'));
        handleEvent(ruleEventStream);
      }
      
    };

    eventSource.onerror = function (error) {
      // console.error('Notification SSE error:', error);
    };

    ruleSource.onerror = function (error) {
      // console.error('Rule SSE error:', error);
    };

    eventSource.onclose = function () {
      // console.log('Notification SSE connection closed');
    };

    ruleSource.onclose = function () {
      // console.log('Rule SSE connection closed');
    };

    return () => {
      eventSource.close();
      ruleSource.close();
    };

  }, [audio]);

  const removeNotification = (index) => {
    setNotificationStack((prevStack) => prevStack.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (notificationStack.length > 0) {
      const timeout = setTimeout(() => {
        setNotificationStack((prevStack) => prevStack.slice(1));
      }, 
      10000
      ); 

      return () => clearTimeout(timeout);
    }
  }, [notificationStack]);

  return (
    <div>
      {notificationStack.map((notification, index) => (
        <div key={index}  style={{zIndex:'1003'}} className={`popup-container-sse ${index === 0 ? 'active' : ''}`}>
          <div className="popup-content" style={{ display: 'flex', flexDirection: 'column', border: '1px solid #dddddd', background: '#f4f7fe', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', margin: '3%', color: '#344767', display: 'flex' }}>{`${notification.heading}`} Alert</div>
              <div style={{ cursor: 'pointer', marginRight: '10px', color: 'black' }} onClick={() => removeNotification(index)}>X</div>
            </div>
            <div style={{ display: 'flex', background: 'white', height: '80px', justifyContent: 'center', alignItems: 'center', color: '#344767' }}>
              <div style={{ fontSize: 'small', textTransform: 'capitalize', marginLeft: '-6%',width:'90%' }}>{notification.notifContent}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
