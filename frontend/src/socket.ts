import { io, Socket } from 'socket.io-client';

export const socket: Socket = io(
  process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001',
);
