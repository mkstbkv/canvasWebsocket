import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

interface Pixel {
  x: number,
  y: number,
}

interface ServerMessage {
  type: string,
  coordinates: Pixel[],
  pixelCoordinates: Pixel
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements AfterViewInit, OnDestroy {
  ws!: WebSocket;
  @ViewChild('canvas') canvas!: ElementRef;

  ngAfterViewInit() {
    this.ws = new WebSocket('ws://localhost:8000/draw');
    this.ws.onclose = () => console.log("ws closed");

    this.ws.onmessage = event => {
      const decodedMessage: ServerMessage = JSON.parse(event.data);

      if (decodedMessage.type === 'PREV_PIXELS') {
        decodedMessage.coordinates.forEach(c => {
          this.drawPixel(c.x, c.y)
        })
      }

      if (decodedMessage.type === 'NEW_PIXEL') {
        const {x, y} = decodedMessage.pixelCoordinates
        this.drawPixel(x, y)
      }
    };
  }

  ngOnDestroy() {
    this.ws.close();
  }

  drawPixel(x: number, y: number) {
    const canvas: HTMLCanvasElement = this.canvas.nativeElement;
    const ctx = canvas.getContext("2d")!;
    ctx.fillRect(x-5, y-5, 10, 10);
  }

  onCanvasClick(event: MouseEvent) {
    console.log(event)
    const x = event.offsetX;
    const y = event.offsetY;
    this.ws.send(JSON.stringify({
      type: 'SEND_PIXEL',
      coordinates: {x, y}
    }))
  }

}
