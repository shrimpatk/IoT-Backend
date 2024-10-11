import { Injectable } from "@nestjs/common";
import axios from "axios";
import { error } from "console";
import { SensorsData } from "src/graphql/models/SensorsData";
import { WebSocket } from 'ws'

@Injectable()
export class SensorService {
  private NODE_RED_URL = "ws://192.168.1.47:1880/ws/pub"
  private ws: WebSocket

  constructor() {
    this.connectWebSocket();
  }

  private connectWebSocket() {
    this.ws = new WebSocket(this.NODE_RED_URL)

    this.ws.on('open', () => {
      console.log('Connected to Node-Red WebSocket')
    })

    this.ws.on('error', (error) => {
      console.error('WebSocket error: ', error)
    })

    this.ws.on('close', () => {
      console.log('WebSocket connection closed. Reconnecting...');
      setTimeout(() => this.connectWebSocket(), 5000);
    });
  }

  async getLastestSensorData(): Promise<SensorsData[]> {
    try {
      const response = await axios.get<SensorsData[]>(`${this.NODE_RED_URL}/api/sensor-data`)
      return response.data
    } catch {
      return null
    }
  }

  startDataStream(callback: (data: SensorsData[]) => void) {
    this.ws.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString()) as SensorsData[];
        console.log(data)
        callback(data)
      } catch (err) {
        console.error("Error parsing sensor data:", error)
      }
    })
  }
}