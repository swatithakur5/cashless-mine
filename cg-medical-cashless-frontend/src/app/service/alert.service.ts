// import {Injectable} from '@angular/core';
// import Swal from 'sweetalert2';

// @Injectable({
//   providedIn: 'root'
// })
// export class AlertService {

//   constructor() {
//   }

//  alert(is_error: boolean, message: string, timer: null | number = null) {
//     const type = is_error ? 'error' : 'success';
//     const options: any = {
//       title: message ?? '',
//       text: '',
//       icon: type,
//       showConfirmButton: false,
//     };
//     if (timer) options.timer = timer;
//     else options.showConfirmButton = true;
//     Swal.fire(options);
//   }

//   alertStatus(status: number, message: string, timer: null | number = null): void {
//     const isSuccess = status >= 200 && status < 300;
//     const type = isSuccess ? 'success' : 'error';
//     const options: any = {
//       title: message ?? '',
//       text: '',
//       icon: type,
//       showConfirmButton: false,
//     };
//     if (timer) options.timer = timer;
//     else options.showConfirmButton = true;
//     Swal.fire(options);
//   }

//   alertSuccess(status: any, title: any = '', message = ''): void {
//     const type = status !== 400 ? 'success' : 'error';
//     Swal.fire({
//       title: title,
//       text: message,
//       icon: type,
//       showConfirmButton: false,
//       timer: 1500
//     })
//   }

//   alertMessage(title: string, html: string, icons: any, confirmButtonText = "OK"): any {
//     return Swal.fire({
//       title: `<b>${title}</b>`,
//       html: html,
//       icon: icons,
//       showConfirmButton: true,
//       confirmButtonText: confirmButtonText,
//       allowOutsideClick: false,
//       allowEscapeKey: false,
//       // timer: 2000,
//       // timerProgressBar: true
//     })
//   }

//   confirmAlert(title: any, html: any, icons: any): any {
//     return Swal.fire({
//       title: `<b>${title}</b>`,
//       text: html,
//       icon: icons,
//       showConfirmButton: true,
//       showCancelButton: true,
//       confirmButtonText: 'Yes',
//       cancelButtonText: 'No',
//       backdrop: true,
//     })
//   }

//   remarkAlert(title: any): any {
//     return Swal.fire({
//       title: `<b>${title}</b>`,
//       input: 'text',
//       icon: 'question',
//       inputAttributes: {
//         required: 'required',
//         placeholder: 'Remark',
//         class: 'form-control'
//       },
//       showCancelButton: true,
//       confirmButtonText: 'Yes',
//       cancelButtonText: 'No',
//       showLoaderOnConfirm: true,
//       preConfirm: (name) => {
//         if (!name) {
//           Swal.showValidationMessage('Remark field is required.')
//         }
//         return name
//       },
//       allowOutsideClick: () => !Swal.isLoading()
//     })
//   }
//   alertMessageLoading(title: string, html: string, icons: any, confirmButtonText = "OK"): any {
//     Swal.fire({
//       title: 'Loading...', 
//       allowOutsideClick: false,
//       allowEscapeKey: false,
//       showConfirmButton: false,
//       didOpen: () => {
//         Swal.showLoading(); 
//       },
//       timer: 5000 
//     }).then(() => {
//       return Swal.fire({
//         title: `<b>${title}</b>`,
//         html: html,
//         icon: icons,
//         showConfirmButton: true,
//         confirmButtonText: confirmButtonText,
//         allowOutsideClick: false,
//         allowEscapeKey: false,
//       });
//     });
//   }
// }



import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  // Basic alert with improved styling
  alert(is_error: boolean, message: string, timer: null | number = null) {
    const type = is_error ? 'error' : 'success';
    const options: any = {
      title: message ?? '',
      text: '',
      icon: type,
      showConfirmButton: false,
      customClass: {
        popup: 'swal-popup-custom',
        title: 'swal-title-custom',
        icon: 'swal-icon-custom'
      },
      iconColor: is_error ? '#dc3545' : '#28a745',
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.4)'
    };
    if (timer) options.timer = timer;
    else options.showConfirmButton = true;
    Swal.fire(options);
  }

  // Status-based alert
  alertStatus(status: number, message: string, timer: null | number = null): void {
    const isSuccess = status >= 200 && status < 300;
    const type = isSuccess ? 'success' : 'error';
    const options: any = {
      title: message ?? '',
      text: '',
      icon: type,
      showConfirmButton: false,
      customClass: {
        popup: 'swal-popup-custom',
        title: 'swal-title-custom',
        icon: 'swal-icon-custom'
      },
      iconColor: isSuccess ? '#28a745' : '#dc3545',
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.4)'
    };
    if (timer) options.timer = timer;
    else options.showConfirmButton = true;
    Swal.fire(options);
  }

  // Success alert with timer
  alertSuccess(status: any, title: any = '', message = ''): void {
    const type = status !== 400 ? 'success' : 'error';
    Swal.fire({
      title: title,
      text: message,
      icon: type,
      showConfirmButton: false,
      timer: 1500,
      customClass: {
        popup: 'swal-popup-custom',
        title: 'swal-title-custom',
        icon: 'swal-icon-custom'
      },
      iconColor: type === 'success' ? '#28a745' : '#dc3545',
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.4)'
    });
  }

  // Enhanced alert message with formal styling
  // alertMessage(title: string, html: string, icons: any, confirmButtonText = "OK"): any {
  //   const iconColors: { [key: string]: string } = {
  //     error: '#dc3545',
  //     success: '#28a745',
  //     warning: '#ffc107',
  //     info: '#17a2b8',
  //     question: '#6c757d'
  //   };

  //   return Swal.fire({
  //     title: `<strong>${title}</strong>`,
  //     html: html,
  //     icon: icons,
  //     showConfirmButton: true,
  //     confirmButtonText: confirmButtonText,
  //     allowOutsideClick: true,
  //     allowEscapeKey: true,
  //     backdrop: true,
  //     customClass: {
  //       popup: 'swal-popup-formal',
  //       title: 'swal-title-formal',
  //       htmlContainer: 'swal-html-formal',
  //       confirmButton: 'swal-button-formal',
  //       icon: 'swal-icon-formal'
  //     },
  //     iconColor: iconColors[icons] || '#6c757d',
  //     confirmButtonColor: icons === 'error' ? '#dc3545' : '#0d6efd',
  //     background: '#ffffff',
  //     width: '450px',
  //     padding: '2rem',
  //     heightAuto: false
  //   });
  // }

  alertMessage(title: string, html: string = '', icons: any, confirmButtonText = "OK"): any {

  return Swal.fire({
    title: `<strong>${title}</strong>`,
    html: html || undefined,
    icon: icons,
    showConfirmButton: true,
    confirmButtonText: confirmButtonText,

    allowOutsideClick: true,
    allowEscapeKey: true,

    customClass: {
      popup: 'swal-popup-formal',
      title: 'swal-title-formal',
      htmlContainer: 'swal-html-formal',
      confirmButton: 'swal-button-formal',
      icon: 'swal-icon-formal'
    },

    iconColor: icons === 'success' ? '#28a745' : '#dc3545',
    confirmButtonColor: icons === 'error' ? '#dc3545' : '#0d6efd',

    background: '#ffffff',
    width: '420px'
  }).then(() => {
    Swal.close();   // 🔥 THIS LINE FIXES YOUR ISSUE
  });

}


  // Confirmation dialog
  confirmAlert(title: any, html: any, icons: any): any {
    const iconColors: { [key: string]: string } = {
      error: '#dc3545',
      success: '#28a745',
      warning: '#ffc107',
      info: '#17a2b8',
      question: '#6c757d'
    };

    return Swal.fire({
      title: `<strong>${title}</strong>`,
      text: html,
      icon: icons,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: {
        popup: 'swal-popup-formal',
        title: 'swal-title-formal',
        confirmButton: 'swal-button-confirm',
        cancelButton: 'swal-button-cancel',
        icon: 'swal-icon-formal'
      },
      iconColor: iconColors[icons] || '#6c757d',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.5)',
      width: '450px',
      padding: '2rem',
      reverseButtons: true
    });
  }

  // Remark input dialog
  remarkAlert(title: any): any {
    return Swal.fire({
      title: `<strong>${title}</strong>`,
      input: 'text',
      icon: 'question',
      inputAttributes: {
        required: 'required',
        placeholder: 'Enter your remark',
        class: 'form-control swal-input-formal'
      },
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      customClass: {
        popup: 'swal-popup-formal',
        title: 'swal-title-formal',
        input: 'swal-input-formal',
        confirmButton: 'swal-button-confirm',
        cancelButton: 'swal-button-cancel',
        icon: 'swal-icon-formal'
      },
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      iconColor: '#6c757d',
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.5)',
      width: '450px',
      padding: '2rem',
      preConfirm: (name) => {
        if (!name) {
          Swal.showValidationMessage('Remark field is required.');
        }
        return name;
      },
      allowOutsideClick: () => !Swal.isLoading()
    });
  }

  // Loading then alert
  alertMessageLoading(title: string, html: string, icons: any, confirmButtonText = "OK"): any {
    Swal.fire({
      title: '<strong>Loading...</strong>',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      customClass: {
        popup: 'swal-popup-formal',
        title: 'swal-title-formal'
      },
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.5)',
      didOpen: () => {
        Swal.showLoading();
      },
      timer: 5000
    }).then(() => {
      return this.alertMessage(title, html, icons, confirmButtonText);
    });
  }

  // Enhanced date validation error (special method for your use case)
  dateValidationError(message: string = 'To Date must be greater than or equal to From Date'): any {
    return Swal.fire({
      title: '<strong>Invalid Date Range</strong>',
      html: `<p style="margin: 0; color: #495057; font-size: 15px; line-height: 1.6;">${message}</p>`,
      icon: 'error',
      showConfirmButton: true,
      confirmButtonText: 'OK',
      allowOutsideClick: true,
      allowEscapeKey: true,
      backdrop: true,
      customClass: {
        popup: 'swal-popup-formal swal-error-formal',
        title: 'swal-title-formal',
        htmlContainer: 'swal-html-formal',
        confirmButton: 'swal-button-error',
        icon: 'swal-icon-error-formal'
      },
      iconColor: '#dc3545',
      confirmButtonColor: '#dc3545',
      background: '#ffffff',
      width: '450px',
      padding: '2.5rem',
      heightAuto: false
    });
  }
}