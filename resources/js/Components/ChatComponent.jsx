import React, { useState , useEffect} from 'react';
import Pusher from 'pusher-js';
import axios from 'axios';
import { OPENAI_API_KEY } from './key';

function ChatComponent() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useEffect(()=>{
        axios.get('/pusher-keys')
        .then(response=>{
            const { key, cluster } = response.data;
            const pusher =new Pusher(key,{
                cluster:cluster
            });

            const channel = pusher.subscribe('chat-channel');
            channel.bind('message', function(data){
                setMessages((prevMessages)=>[...prevMessages,{text:data.message, user:false}]);
            });
            return ()=>{
                pusher.unsubscribe('chat-channel');
            };
        }).catch(error=>{
            console.error('Error fetching Pusher keys :', error);  
        });
    },[]);

    const sendMessage = async() => {
        if (input.trim() !== '') {
            setMessages([...messages, { text: input, user: true }]);

            await fetch('/send-message',{
                method:'POST',
                headers:{
                    'Content-type':'application/json',
                },
                body: JSON.stringify({message:input}),
            });

            const response = await axios.post('',{
                prompt:input,
                max_tokens: 150,
            },{
                headers:{
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                },
            });
            setMessages((prevMessages) => [...prevMessages, { text: response.data.choices[0].text, user: false }]);
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.user ? 'user-message' : 'bot-message'}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="input-container">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

export default ChatComponent;