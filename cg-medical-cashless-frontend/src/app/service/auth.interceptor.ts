import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { LoaderService } from "./loader.service";
import { catchError, finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { moduleMapping } from "environment";
import { CookieService } from "ngx-cookie-service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private cookie: CookieService, private loaderService: LoaderService) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<any>> {
    let designation_id = this.cookie.get('designation_id');
    const token = this.cookie.get('token') || localStorage.getItem('token');
    const headers: any = { 'x-designation-id': designation_id ?? '' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const modifiedRequest = request.clone({ setHeaders: headers });
    this.loaderService.show();
    return next.handle(modifiedRequest).pipe(
      catchError((err) => {
        if (err.status === 401) {
          Swal.fire({ title: 'Please try to Login again!', icon: 'error' }).then(res => {
            this.cookie.deleteAll('/');
            // console.log("moduleMapping.adminModule ", moduleMapping.adminModule);
            // console.log("moduleMapping ", moduleMapping);
            window.open(moduleMapping.adminModule, '_self')
          })
        }
        if (err.status === 0) {
          Swal.fire({ title: 'Server Not Connected....', icon: 'error' }).then(res => {
            this.cookie.deleteAll('/');
            // console.log("moduleMapping.adminModule ", moduleMapping.adminModule);

            window.open(moduleMapping.adminModule, '_self')
          })
        }
        const error = err.error.message || err.statusText;
        return throwError(error); // Propagate error further
      }),
      finalize(() => {
        this.loaderService.hide()
      }
      ),
    );
  }
}
