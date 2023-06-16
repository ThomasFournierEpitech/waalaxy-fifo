import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
import { FifoEvent } from 'src/shared/fifo.type';

@WebSocketGateway({ cors: true })
export class FifoGateway {
  @WebSocketServer()
  server: Server;
  private readonly logger: Logger = new Logger('FifoGateway');

  sendEventToClients(event: FifoEvent) {
    this.server.emit(event.type, event);
  }
}
