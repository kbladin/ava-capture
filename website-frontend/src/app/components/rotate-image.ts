//
// Copyright (c) 2017 Electronic Arts Inc. All Rights Reserved 
//

import { Component, Input, Output, ElementRef, EventEmitter } from '@angular/core';

@Component({
  selector: 'rotate_img',
  template: `<div style="white-space: nowrap; display: inline-block;" [style.height.px]="_divHeight">
              <div *ngIf="angle==90 || angle==270" style="display: inline-block; vertical-align: middle; width:1px;" [style.height.px]="width"></div>
              <img 
               style="vertical-align:middle;"
               (load)="newImageLoaded()"
               (click)="imgclick($event)"
               (mousemove)="mouseOver($event)"
               [width]="width" 
               [src]="src"
               [class.rotate-90]="angle==90"
               [class.rotate-180]="angle==180"
               [class.rotate-270]="angle==270">
             </div>
             <div class="color_values"></div>`
})
export class RotateImage {

  @Input() src : any;
  @Input() width : any = null;
  @Input() angle : number = 0;
  @Output() click = new EventEmitter<any>();

  private _divHeight:number = null;

  divHeight():number {
    var imgElems = this.el.nativeElement.getElementsByTagName('img');
    if (imgElems.length > 0) {
      var img = imgElems[0];
      if (img) {
        if (img.naturalWidth>0) {
          var naturalWidth = this.width ? this.width : img.naturalWidth;
          var naturalHeight = this.width ? (this.width * img.naturalHeight / img.naturalWidth) : img.naturalHeight;
          if (this.angle==90 || this.angle==270)
            return naturalWidth;
          return naturalHeight;
        }
      }
    }
    return null;
  }

  el : ElementRef;

  constructor(el: ElementRef) {
    this.el = el;
  }  

  imgclick(event : any) {
    this.click.emit(event);
  }

  updateDimensions(): void {
    this._divHeight = this.divHeight();
  }

  newImageLoaded(): void {
    this.updateDimensions();
  }

  ngOnInit(): void {
    this.updateDimensions();
  }

  ngOnChanges() {
    this.updateDimensions();
  }
  
  pixelValue(x : number, y : number) {
    var imgElems = this.el.nativeElement.getElementsByTagName('img');
    if (imgElems.length > 0) {
      var img = imgElems[0];
      if (img) {
        // Convert to canvas to be able to sample pixel value. Unsure about the
        // performance cost of drawing the image in the canvas.
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
        var pixelData = canvas.getContext('2d').getImageData(x, y, 1, 1).data;
        return pixelData;
      }
    }
    return null;
  }

  mouseOver(event) {
    var imgElems = this.el.nativeElement.getElementsByTagName('img');
    if (imgElems.length > 0) {
      var img = imgElems[0];
      if (img) {
        var rect = event.target.getBoundingClientRect();
        var x = event.clientX - rect.left; //x position within the element.
        var y = event.clientY - rect.top;  //y position within the element.
        var pixelData = this.pixelValue(x, y);
        
        var r = pixelData[0] / 255;
        var g = pixelData[1] / 255;
        var b = pixelData[2] / 255;

        // Display pixels are in gamma space since it is a jpeg preview,
        // Need to convert back to linear.
        var gamma = 2.2;

        var colorValuesElements = this.el.nativeElement.getElementsByClassName('color_values');
        if (colorValuesElements.length > 0) {
          var colorValuesElement = colorValuesElements[0];
          if (colorValuesElement) {
            colorValuesElement.innerHTML =
              "Linear RGB: [" +
              Math.pow(r, gamma).toFixed(3) + ", " +
              Math.pow(g, gamma).toFixed(3) + ", " +
              Math.pow(b, gamma).toFixed(3) + "]";
          }
        }
      }
    }
  }
}
