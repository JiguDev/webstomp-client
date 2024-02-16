import React, {useEffect, useState} from 'react';
import {Button, SafeAreaView, Text, View} from 'react-native';
import {
  setConfig,
  connectWebSocket,
  disconnectWebSocket,
  sendMessage,
} from './WebSocketService';

const App = () => {
  const [messages, setMessages] = useState([]);
  const taskSid = 'WTdd2cf27d5d3ee515484dcfb7e13f84df';
  const queueSid = 'WQ4880b679c8fefa4dba13081e603da31d';
  const messagingServiceKey = 'b2bed1e4-b282-456a-8d70-52b8ffee15cb';

  useEffect(() => {
    setConfig(taskSid, queueSid, messagingServiceKey);
    connectWebSocket(setMessages);

    return () => {
      disconnectWebSocket();
    };
  }, []);

  const handleSendMessage = () => {
    const messagePayload = JSON.stringify({
      timestamp: 0,
      sender: taskSid,
      conversation_id: taskSid,
      message: 'Soham Mobile Test 23612312310',
    });

    sendMessage(messagePayload);
  };

  return (
    <SafeAreaView>
      <View>
        <Text>Socket Demo</Text>
        {messages.map((message, index) => (
          <Text key={index}>{message}</Text>
        ))}
        <Button title="Send a Message" onPress={handleSendMessage} />
      </View>
    </SafeAreaView>
  );
};

export default App;
