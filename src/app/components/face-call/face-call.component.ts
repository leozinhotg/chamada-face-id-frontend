import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { cilCheckAlt } from '@coreui/icons';
import { IconSetService } from '@coreui/icons-angular';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as faceapi from 'face-api.js';
import { ClassStudents } from 'src/app/shared/response/turmas.response';
import { FaceIdService } from 'src/app/shared/service/face-id.service';

@Component({
  selector: 'app-face-call',
  templateUrl: './face-call.component.html',
  styleUrls: ['./face-call.component.scss']
})
export class FaceCallComponent implements OnInit {

  @ViewChild('streamRef', { static: true }) streamRef!: any;
  @ViewChild('content', { static: true }) content!: any;
  public stream: MediaStream = new MediaStream;
  public nameStudent: string = '';
  public photo: string = '';
  private class: ClassStudents = new ClassStudents;
  private imageDescriptors: any = [];
  private faceMatcher: any;

  constructor(
    private modalService: NgbModal,
    public iconSet: IconSetService,
    private faceIdService: FaceIdService,
  ) {
    iconSet.icons = { cilCheckAlt };
  }

  ngOnInit() {
    this.instanceFaceApi().then(() => {
      this.getStudents();
    });
  }

  private getStudents() {
    this.faceIdService.getStudents().subscribe((res) => {
      this.class = res;
      this.class.students.forEach(element => {
        this.processImagem(element.photo, element.name);
      });
      this.permissionDevices();
    });
  }

  private openModal(content: any) {
    this.modalService.open(content);
  }

  private closeModal() {
    this.modalService.dismissAll();
  }

  async instanceFaceApi() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models');
  }

  private loaderCanvaImage() {
    let webCamRef = this.streamRef.nativeElement;

    const matchStudent = async () => {
      const face = await faceapi.detectSingleFace(webCamRef, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (typeof face === 'undefined') return;

      this.matcher(face);
    }

    setInterval(matchStudent, 2000);
  }

  async processImagem(image: any, label: string) {
    const img = faceapi.fetchImage(`data:image/png;base64,${image}`);

    const detection = await faceapi.detectSingleFace(await img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (typeof detection === 'undefined') return;

    this.imageDescriptors.push({
      id: label,
      detection
    });

    this.faceMatcher = new faceapi.FaceMatcher(this.imageDescriptors.map(
      (faceDescriptor: any) => (
        new faceapi.LabeledFaceDescriptors(
          (faceDescriptor.id).toString(), [faceDescriptor.detection.descriptor]
        )
      )
    ))
  }

  private matcher(detection: any) {
    if (detection) {
      const bestMatch = this.faceMatcher.findBestMatch(detection.descriptor);
      if (bestMatch.label !== 'unknown') {
        const indexStudent = this.class.students.findIndex(element => element.name === bestMatch.label);

        this.faceIdService.getPresence(this.class.students[indexStudent].registration).subscribe((res) => {
          if(res.code === 100){
            this.nameStudent = bestMatch.label;
            this.photo = `data:image/png;base64,${this.class.students[indexStudent].photo}`;
            this.openModal(this.content);
          }
        });
      }
      setTimeout(() => {
        this.closeModal();
      }, 3000)
    }
  }

  private permissionDevices() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        this.getDeviceVideo();
      })
  }

  private getDeviceVideo() {
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        if (Array.isArray(devices)) {
          devices.forEach(device => {
            if (device.kind === 'videoinput') {
              if (device.label.includes('iVCam')) {
                navigator.mediaDevices.getUserMedia({
                  video: {
                    deviceId: device.deviceId
                  }
                }
                ).then((stream) => {
                  this.stream = stream;
                  this.loaderCanvaImage();
                });
              }
            }
          });
        }
      })
  }

}
