import {useEffect} from 'react';
import webstomp from 'webstomp-client';

let client = null;
let task_sid = null;
let queue_sid = null;
let messagingServiceKey = null;
let interval = null;

const setConfig = (tsid, qsid, msk) => {
  task_sid = tsid;
  queue_sid = qsid;
  messagingServiceKey = msk;
};

const connectWebSocket = setMessages => {
  if (!task_sid || !queue_sid || !messagingServiceKey) {
    console.error('Task SID, Queue SID, or Messaging Service Key is missing!');
    return;
  }

  try {
    client = webstomp.client(
      'wss://api-alb-beta.rainntest.com/hotlines/ohl/websocket',
      {heartbeat: {incoming: 15000, outgoing: 15000}, debug: true},
    );
  } catch {
    e => {
      console.log('connection err:', e);
    };
  }

  client.connect(
    {
      OWASP_CSRFGUARD: '',
      'g-recaptcha-response': '',
      survivor_task_sid: `${task_sid}`,
      messaging_service_key: `${messagingServiceKey}`,
      'client-id': `${task_sid}`,
    },
    () => {
      console.log('WebSocket connected successfully');

      subscribeToVisitorPosition();
      subscribeToTaskConversation(setMessages);
      subscribeToIsTyping();
      subscribeToTaskStatus();
      subscribeToPong();
      // Start sending ping messages at regular intervals
      interval = setInterval(() => {
        sendPing();
      }, 15000); // 15 seconds
    },
    error => {
      console.error('WebSocket connection error', error);
    },
  );
};

const subscribeToVisitorPosition = () => {
  client.subscribe(`/topic/visitor-position/${queue_sid}`, message => {
    console.log('Received visitor-position message:', message.body);
    // Handle received message for visitor-position
  });
};

const subscribeToTaskConversation = setMessages => {
  client.subscribe(
    `/topic/webchat/task-conversation/${task_sid}`,
    message => {
      console.log('Received task-conversation message:', message.body);
      // Handle received message for task-conversation
      setMessages(prevMessages => [...prevMessages, message.body]);
      message.ack();
    },
    {
      id: `task-${task_sid}`,
      'activemq.subscriptionName': `task-conversation/${task_sid}`,
      ack: 'client',
    },
  );
};

const subscribeToIsTyping = () => {
  client.subscribe(
    `/topic/task-conversation/is-typing/${task_sid}`,
    message => {
      console.log(
        'Received task-conversation is typing message:',
        message.body,
      );
      // Handle received message for task-conversation
    },
  );
};

const subscribeToTaskStatus = () => {
  client.subscribe(`/user/queue/task-status`, message => {
    console.log('Received task-status message:', message.body);
    // Handle received message for task-conversation
  });
};

const subscribeToPong = () => {
  client.subscribe('/user/queue/pong', message => {
    console.log('Received pong message:', message.body);
    // Handle received message for task-conversation
  });
};

const sendMessage = messagePayload => {
  if (client && client.connected) {
    client.send(`/app/webchat/task-conversation/${task_sid}`, messagePayload, {
      destination: `/app/webchat/task-conversation/${task_sid}`,
      persistent: true,
      // 'content-length': messagePayload.length.toString(),
    });
  } else {
    console.warn('WebSocket is not connected.');
  }
};

const sendPing = () => {
  if (client && client.connected) {
    const pingMessage = `${task_sid}`;
    console.log('12312123', pingMessage, task_sid);
    client.send('/app/ping', task_sid);
  } else {
    console.warn('WebSocket is not connected.');
  }
};

const disconnectWebSocket = () => {
  if (client && client.connected) {
    client.disconnect();
    clearInterval(interval);
  }
};

export {setConfig, connectWebSocket, sendMessage, disconnectWebSocket};
