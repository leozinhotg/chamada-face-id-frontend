import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { cilUser } from '@coreui/icons';
import { IconSetService } from '@coreui/icons-angular';
import { Turma } from 'src/app/shared/response/turmas.response';
import { FaceIdService } from 'src/app/shared/service/face-id.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public turmaSelect: string = '';
  public turmaList: Array<Turma> = new Array<Turma>();

  constructor(
    private faceIdService: FaceIdService,
    public iconSet: IconSetService,
    private router: Router
  ) { 
    iconSet.icons = { cilUser };
  }

  ngOnInit() {
    this.callGetTurmas();
  }

  private callGetTurmas() {
    this.faceIdService.getTurmas().subscribe((res) => {
      this.turmaList = res.turmas;
      this.turmaSelect = res.turmas[0].name;
    }, (err) =>{
      this.callGetTurmas();
    })
  }

  public goFaceCall(){
    const indexClass = this.turmaList.findIndex(element => element.name === this.turmaSelect);
    this.faceIdService.turmaId = this.turmaList[indexClass].id;
    this.router.navigate(['/', 'face-call']);
  }
}
