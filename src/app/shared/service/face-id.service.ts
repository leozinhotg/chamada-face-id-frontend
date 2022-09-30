import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ClassStudents, TurmaResponse } from '../response/turmas.response';
import { urlConfig } from 'src/config/url.config';

@Injectable({
  providedIn: 'root'
})
export class FaceIdService {

  public turmaId: string = '';

  constructor(
    private httpClient: HttpClient
  ) { }

  public getTurmas(): Observable<TurmaResponse> {
    return this.httpClient.get<TurmaResponse>(urlConfig.url_get_turmas).pipe(map(res => {
      return res;
    }));
  }

  public getStudents(): Observable<ClassStudents> {
    return this.httpClient.get<ClassStudents>(`${urlConfig.url_get_students}/${this.turmaId}`).pipe(map(res => {
      return res;
    }));
  }

  public getPresence(matricula: string): Observable<any> {
    return this.httpClient.get<any>(`${urlConfig.url_get_presence}/${matricula}`).pipe(map(res => {
      return res;
    }));
  }
}
