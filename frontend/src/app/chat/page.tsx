import {io} from 'socket.io-client';

const socket = io('http://localhost:1337');

export default function Chat() {
    return (
        <div>
            <h2>Chat</h2>
        </div>
    );
}