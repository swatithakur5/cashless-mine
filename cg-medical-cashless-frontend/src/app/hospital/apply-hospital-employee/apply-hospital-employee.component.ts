import { Component, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';

import { HttpService } from '../../service/http.service';
import { AlertService } from '../../service/alert.service';
import { EncryptionService } from '../../service/encryption.service';

@Component({
  selector: 'app-apply-hospital-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatExpansionModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatTooltipModule,
    NgSelectModule,
  ],
  templateUrl: './apply-hospital-employee.component.html',
  styleUrl: './apply-hospital-employee.component.scss',
})
export class ApplyHospitalEmployeeComponent implements OnInit {
  panelOpenStateFirst = signal(true);
  panelOpenStateSecond = signal(true);
  panelOpenStateThird = signal(true);
  panelOpenStateFourth = signal(true);

  ApplyMedicalReimbursementMainFormGroup!: FormGroup;
  treatmentTypeList: any = [];
  relationMap: any = {};
  selectedRelationCode: any;
  relationList: any = [];
  patientList: any = [];
  patientDropdownList: any = [];
  procedureTypeList: any = [];
  procedureDetailsList: any = [];
  districtList: any = [];
  hospitalList: any = [];
  isReadonly: boolean = false;
  fileValid = false;
  isIpdType: boolean = false;
  idpTypeList: any[] = [];
  isProcedureType: boolean = false;
  editIndex: number | null = null;
  fileStore: any = {};
  today = new Date();
  documentList: any = [];
  officeAdminDetails: any = {};

  // Logged-in hospital employee code (set at hospital login). Drives emp/family lookups.
  private empCode = (typeof localStorage !== 'undefined' && localStorage.getItem('hospital_emp_code')) || '';
  // DDO under which the office admin (reporting officer) is resolved. Matches seeded demo employees.
  private readonly DDO_CODE = 417008;

  hospitalLocationList = [
    { label: 'Inside Chhattisgarh', value: 'INSIDE_CG' },
    { label: 'Outside Chhattisgarh', value: 'OUTSIDE_CG' },
  ];

  hospitalTypeList = [
    { label: 'Government', value: 'GOVT' },
    { label: 'Private', value: 'PRIVATE' },
  ];

  recognisedHospitalList = [
    { label: 'Yes', value: 'Y' },
    { label: 'No', value: 'N' },
  ];

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    private router: Router,
    private es: EncryptionService,
  ) {}

  ngOnInit(): void {
    this.getMasProcedureDetailsByTypeCode();
    this.getMasTreatmentType();
    this.getMasDistrictDetails();
    this.getMasDocumentDetails();
    this.getAuthDesignationDetails();

    this.relationList.forEach((item: any) => {
      this.relationMap[item.relation] = item.relation_code;
    });
  }

  togglePanelFirst() { this.panelOpenStateFirst.set(!this.panelOpenStateFirst()); }
  togglePanelSecond() { this.panelOpenStateSecond.set(!this.panelOpenStateSecond()); }
  togglePanelThird() { this.panelOpenStateThird.set(!this.panelOpenStateThird()); }
  togglePanelFourth() { this.panelOpenStateFourth.set(!this.panelOpenStateFourth()); }

  createForm() {
    const otherDetailsGroup: FormGroup<any> = this.fb.group({
      is_treatment_available_in_state: [],
      hospital_accredited: [],
      refer_doctor_name: [],
    });

    this.documentList.forEach((doc: any) => {
      const validators = doc.is_required === 1 ? [Validators.required] : [];
      otherDetailsGroup.addControl(doc.form_control_name, this.fb.control(null, validators));
      otherDetailsGroup.addControl(`${doc.form_control_name}_amount`, this.fb.control(null));
      otherDetailsGroup.addControl(`${doc.form_control_name}_date`, this.fb.control(null));
    });

    this.ApplyMedicalReimbursementMainFormGroup = this.fb.group({
      basicDetails: this.fb.group({
        emp_name: ['', Validators.required],
        designation_name: ['', Validators.required],
        patient_name: ['', Validators.required],
        relation_code: ['', Validators.required],
        action_code: [4],
        channel_purpose_code: [1],
      }),
      treatmentForm: this.newTreatmentRow(),
      treatmentDetails: this.fb.array([]),
      otherDetails: otherDetailsGroup,
    });
  }

  newTreatmentRow(): FormGroup {
    return this.fb.group(
      {
        treatment_type_code: [null, Validators.required],
        ipd_type_code: [null, Validators.required],
        procedure_code: [null, Validators.required],
        district_code: [null, Validators.required],
        hospital_code: [null, Validators.required],
        treatment_from_date: [null, Validators.required],
        treatment_to_date: [null, Validators.required],
        search_data: [],
        total_days: [{ value: 0 }],
        hospital_type: [''],
        is_recognised: [''],
        disease_name: [''],
        receipt_no: [null],
        receipt_date: [null],
        quantity: [null],
        rate_per_unit: [null],
        claim_amount: [null],
      },
      { validators: this.dateRangeValidator() },
    );
  }

  minArrayLength(min: number) {
    return (formArray: any) => (formArray && formArray.length >= min ? null : { minLengthArray: true });
  }

  checkInputType() {
    const value = this.treatmentForm.get('search_data')?.value;
    if (!value) {
      this.procedureDetailsList = [];
      this.getMasProcedureDetailsByTypeCode();
      return;
    }
    const isNumber = !isNaN(Number(value));
    this.procedureDetailsList = [];
    let params: any = isNumber ? { procedure_code: Number(value) } : { procedure_name_en: value };
    this.http.getParam('/mrMaster/get/getMasProcedureDetailsByTypeCode', params, 'admin').subscribe((res) => {
      if (!res.body.error) {
        this.procedureDetailsList = res.body.data;
        if (this.procedureDetailsList.length > 0) {
          this.treatmentForm.patchValue({ procedure_code: this.procedureDetailsList[0].procedure_code });
        }
      }
    });
    this.getMasProcedureDetailsByTypeCode();
  }

  get treatmentDetails(): FormArray {
    return this.ApplyMedicalReimbursementMainFormGroup.get('treatmentDetails') as FormArray;
  }

  get treatmentForm(): FormGroup {
    return this.ApplyMedicalReimbursementMainFormGroup.get('treatmentForm') as FormGroup;
  }

  addTreatment() {
    const treatmentForm = this.ApplyMedicalReimbursementMainFormGroup.get('treatmentForm') as FormGroup;
    const treatmentArray = this.ApplyMedicalReimbursementMainFormGroup.get('treatmentDetails') as FormArray;

    treatmentForm.markAllAsTouched();
    if (treatmentForm.invalid) return;

    const formValue = treatmentForm.getRawValue();
    if (!formValue.treatment_type_code) return;

    const isEmpty = Object.values(formValue).every((val) => val === null || val === '');
    if (isEmpty) return;

    treatmentArray.push(this.fb.group(formValue));

    const retainedValues = {
      district_code: treatmentForm.get('district_code')?.value,
      hospital_code: treatmentForm.get('hospital_code')?.value,
      treatment_from_date: treatmentForm.get('treatment_from_date')?.value,
      treatment_to_date: treatmentForm.get('treatment_to_date')?.value,
    };

    treatmentForm.reset();
    treatmentForm.patchValue(retainedValues);
    treatmentForm.markAsPristine();
    treatmentForm.markAsUntouched();
    this.onDateChange();

    if (treatmentArray.length > 0) {
      this.clearValidator('treatmentForm.treatment_type_code');
      this.clearValidator('treatmentForm.ipd_type_code');
      this.clearValidator('treatmentForm.procedure_code');
      this.clearValidator('treatmentForm.receipt_no');
      this.clearValidator('treatmentForm.receipt_date');
      this.clearValidator('treatmentForm.quantity');
      this.clearValidator('treatmentForm.rate_per_unit');
      this.clearValidator('treatmentForm.claim_amount');
      this.clearValidator('treatmentForm.treatment_from_date');
      this.clearValidator('treatmentForm.treatment_to_date');
      this.clearValidator('treatmentForm.hospital_code');
      treatmentArray.updateValueAndValidity();
    }

    this.isIpdType = false;
    this.isProcedureType = false;
    this.ApplyMedicalReimbursementMainFormGroup.updateValueAndValidity();
  }

  removeTreatment(index: number) {
    const treatmentArray = this.ApplyMedicalReimbursementMainFormGroup.get('treatmentDetails') as FormArray;
    treatmentArray.removeAt(index);
    treatmentArray.updateValueAndValidity();
    this.ApplyMedicalReimbursementMainFormGroup.updateValueAndValidity();
    if (this.editIndex === index) {
      this.editIndex = null;
      this.treatmentForm.reset();
    }
  }

  resetFormMode() {
    this.editIndex = null;
    this.treatmentForm.reset();
  }

  editTreatment(index: number) {
    this.editIndex = index;
    this.treatmentForm.patchValue(this.treatmentDetails.at(index).value);
  }

  updateTreatment() {
    if (this.editIndex === null) return;
    const updatedData = this.treatmentForm.getRawValue();
    this.treatmentDetails.at(this.editIndex).patchValue(updatedData);
    this.editIndex = null;
    const retainedValues = {
      district_code: updatedData.district_code,
      hospital_code: updatedData.hospital_code,
      treatment_from_date: updatedData.treatment_from_date,
      treatment_to_date: updatedData.treatment_to_date,
    };
    this.treatmentForm.reset();
    this.treatmentForm.patchValue(retainedValues);
    this.onDateChange();
  }

  addTreatmentRow() { this.treatmentDetails.push(this.newTreatmentRow()); }
  removeTreatmentRow(index: number) { this.treatmentDetails.removeAt(index); }

  getMasTreatmentType() {
    this.http.getData('/mrMaster/get/getMasTreatmentType', 'admin').subscribe((res) => {
      if (!res.body.error) this.treatmentTypeList = res.body.data;
    });
  }

  getMasIpdType() {
    this.http.getData('/mrMaster/get/getMasIpdType', 'admin').subscribe((res) => {
      if (!res.body.error) this.idpTypeList = res.body.data;
    });
  }

  getEmpDetailsByEmpCode() {
    let params = { emp_code: this.empCode };
    this.http.getParam('/employee/get/getEmpDetailsByEmpCode', params, 'admin').subscribe((res) => {
      if (!res.body.error) {
        this.patientList = res.body.data;
        this.ApplyMedicalReimbursementMainFormGroup.get('basicDetails')?.patchValue({
          emp_name: this.patientList[0]?.name_en,
          designation_name: this.patientList[0]?.designation_name,
        });
      }
    });
  }

  getRelationDetailsByEmpCode() {
    let params = { emp_code: this.empCode };
    this.http.getParam('/employee/get/getRelationDetailsByEmpCode', params, 'admin').subscribe((res) => {
      if (!res.body.error) {
        const data = res.body.data;
        this.patientDropdownList = data.map((item: any) => ({
          name: item.name,
          relation: item.relation,
          relation_code: item.relation_code,
        }));
        this.relationList = [
          ...new Map(data.map((item: any) => [item.relation, { relation: item.relation }])).values(),
        ];
        data.forEach((item: any) => {
          this.relationMap[item.relation] = item.relation_code;
        });
      }
    });
  }

  onChangePatientName(selectedPatient: any) {
    if (!selectedPatient) return;
    if (!selectedPatient.relation_code) {
      console.error('relation_code missing in dropdown data');
      return;
    }
    this.selectedRelationCode = selectedPatient.relation_code;
    this.ApplyMedicalReimbursementMainFormGroup.get('basicDetails')?.patchValue({
      relation_code: selectedPatient.relation,
    });
  }

  treatmentTypeChange(value: any) {
    if (value.treatment_type_code == 1) {
      this.treatmentForm.patchValue({
        ipd_type_code: null,
        procedure_code: null,
        receipt_no: null,
        receipt_date: null,
        quantity: null,
        rate_per_unit: null,
        claim_amount: null,
      });
      this.getMasProcedureType();
      this.clearValidator('treatmentForm.ipd_type_code');
      this.setValidator('treatmentForm.procedure_code', [Validators.required]);
      this.isIpdType = false;
      this.isProcedureType = true;
    } else if (value.treatment_type_code == 2) {
      this.isIpdType = true;
      this.treatmentForm.patchValue({
        ipd_type_code: null,
        procedure_code: null,
        receipt_no: null,
        receipt_date: null,
        quantity: null,
        rate_per_unit: null,
        claim_amount: null,
      });
      this.getMasIpdType();
      this.setValidator('treatmentForm.ipd_type_code', [Validators.required]);
    } else {
      this.isIpdType = false;
    }
  }

  ipdTypeChange(value: any) {
    // 3 = test, 4 = surgery -> a procedure must be chosen
    if (value.ipd_type_code == 3 || value.ipd_type_code == 4) {
      this.isProcedureType = true;
      this.setValidator('treatmentForm.procedure_code', [Validators.required]);
    } else {
      this.treatmentForm.patchValue({ procedure_code: null });
      this.isProcedureType = false;
      this.clearValidator('treatmentForm.procedure_code');
    }
  }

  getMasProcedureType() {
    this.http.getData('/mrMaster/get/getMasProcedureType', 'admin').subscribe((res) => {
      if (!res.body.error) this.procedureTypeList = res.body.data;
    });
  }

  getMasDocumentDetails() {
    this.http.getData('/mrMaster/get/getMasDocumentDetails', 'admin').subscribe((res) => {
      if (!res.body.error) {
        this.documentList = res.body.data;
        this.createForm();
        this.getEmpDetailsByEmpCode();
        this.getRelationDetailsByEmpCode();
      }
    });
  }

  procedureTypeChange(event: any) {
    this.treatmentForm.patchValue({ procedure_code: null });
  }

  getMasProcedureDetailsByTypeCode() {
    this.procedureDetailsList = [];
    this.http.getData('/mrMaster/get/getMasProcedureDetailsByTypeCode', 'admin').subscribe((res) => {
      if (!res.body.error) this.procedureDetailsList = res.body.data;
    });
  }

  getMasDistrictDetails() {
    this.http.getData('/mrMaster/get/getMasDistrictDetails', 'admin').subscribe((res) => {
      if (!res.body.error) this.districtList = res.body.data;
    });
  }

  districtChange(event: any) {
    this.treatmentForm.patchValue({ hospital_code: null });
    this.getMasHospitalDetails(event.district_code);
  }

  getMasHospitalDetails(district_code: any) {
    let params = { district_code: district_code };
    this.http.getParam('/mrMaster/get/getMasHospitalDetails', params, 'admin').subscribe((res) => {
      if (!res.body.error) this.hospitalList = res.body.data;
    });
  }

  getTreatmentName(code: any): string {
    return this.treatmentTypeList.find((x: any) => x.treatment_type_code === code)?.treatment_type_short_name_en || '';
  }
  getIpdName(code: any): string {
    return this.idpTypeList.find((x) => x.ipd_type_code === code)?.ipd_name_en || '';
  }
  getProccedureType(code: any) {
    return this.procedureTypeList.find((x: any) => x.procedure_type_code === code)?.procedure_type_name_en || '';
  }
  getProccedureDetails(code: any) {
    return this.procedureDetailsList.find((x: any) => x.procedure_code === code)?.procedure_name_en || '';
  }
  getDistrictDetails(code: any) {
    return this.districtList.find((x: any) => x.district_code === code)?.district_name_en || '';
  }
  getHospitalDetails(code: any) {
    return this.hospitalList.find((x: any) => x.hospital_code === code)?.hospital_name_en || '';
  }

  get totalAmount(): number {
    return this.treatmentDetails.controls.reduce((sum, row) => {
      const amt = row.get('claim_amount')?.value || 0;
      return sum + Number(amt);
    }, 0);
  }

  updateClaimAmount() {
    if (this.treatmentForm.get('quantity')?.value && this.treatmentForm.get('rate_per_unit')?.value) {
      const qty = Number(this.treatmentForm.get('quantity')?.value) || 0;
      const rate = Number(this.treatmentForm.get('rate_per_unit')?.value) || 0;
      this.treatmentForm.patchValue({ claim_amount: qty * rate }, { emitEvent: false });
    } else {
      this.treatmentForm.patchValue({ claim_amount: null });
    }
  }

  onGenericFileChange(event: any, controlName: string) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      this.alert.alertMessage('Upload Failed', 'Only PDF allowed', 'error');
      return;
    }
    if (file.size > 500 * 1024) {
      this.alert.alertMessage('Upload Failed', 'PDF must be ≤ 500KB', 'error');
      return;
    }
    this.fileStore[controlName] = { file: file, fileName: file.name, valid: true };
  }

  resetGenericFile(controlName: string, input?: HTMLInputElement) {
    delete this.fileStore[controlName];
    if (input) input.value = '';
  }

  viewGenericFile(controlName: string) {
    const fileObj = this.fileStore[controlName];
    if (!fileObj) return;
    const url = URL.createObjectURL(fileObj.file);
    window.open(url, '_blank');
  }

  getFileValid(controlName: string) {
    return this.fileStore[controlName]?.valid || false;
  }
  getFileName(controlName: string) {
    return this.fileStore[controlName]?.fileName || 'No file chosen';
  }

  setValidator(controlName: string, validators: any[]) {
    const control = this.ApplyMedicalReimbursementMainFormGroup.get(controlName);
    if (control) {
      control.setValidators(validators);
      control.updateValueAndValidity();
    }
  }

  clearValidator(controlName: string) {
    const control = this.ApplyMedicalReimbursementMainFormGroup.get(controlName);
    if (control) {
      control.clearValidators();
      control.updateValueAndValidity();
    }
  }

  dateRangeValidator() {
    return (group: AbstractControl) => {
      const from = group.get('treatment_from_date')?.value;
      const to = group.get('treatment_to_date')?.value;
      if (!from || !to) return null;
      return new Date(to) < new Date(from) ? { invalidDateRange: true } : null;
    };
  }

  onDateChange() {
    if (this.treatmentForm.errors?.['invalidDateRange']) {
      this.alert.alertMessage('To Date must be greater than or equal to From Date', '', 'warning');
      this.treatmentForm.patchValue({ treatment_from_date: null, treatment_to_date: null, total_days: 0 });
      return;
    }
    this.calculateDays();
  }

  calculateDays() {
    const from = this.treatmentForm.get('treatment_from_date')?.value;
    const to = this.treatmentForm.get('treatment_to_date')?.value;
    if (!from || !to) return;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffTime = toDate.getTime() - fromDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    this.treatmentForm.patchValue({ total_days: diffDays });
  }

  procedureSearch(term: string, item: any): boolean {
    term = term.toLowerCase();
    return (
      item.procedure_name_en?.toLowerCase().includes(term) || item.procedure_code?.toString().includes(term)
    );
  }

  saveMedicalReimbursement() {
    const formValue = this.ApplyMedicalReimbursementMainFormGroup.value;
    if (!this.officeAdminDetails) {
      return this.alert.alertMessage('Error', 'Your Office Admin is not mapped.', 'error');
    }
    if (!formValue.treatmentDetails || formValue.treatmentDetails.length === 0) {
      return this.alert.alertMessage('Error', 'Please add at least one treatment', 'error');
    }

    const basic: any = { ...formValue.basicDetails };
    if (typeof basic.patient_name === 'object') {
      basic.patient_name = basic.patient_name?.name || '';
    }
    let relationName = basic.relation_code;
    if (typeof relationName === 'object') {
      relationName = relationName?.relation || relationName?.label;
    }
    let relationCode = this.relationMap?.[relationName];
    if (!relationCode || isNaN(Number(relationCode))) {
      relationCode = 1;
    }
    basic.relation_name = relationName || 'SELF';
    basic.relation_code = Number(relationCode);

    const documentsPayload: any[] = [];
    this.documentList.forEach((doc: any, index: number) => {
      const fileObj = this.fileStore[doc.form_control_name];
      if (fileObj) {
        documentsPayload.push({
          document_code: doc.document_code,
          file_name: fileObj.file.name,
          file_key: `file_${index}`,
        });
      }
    });

    const formData = new FormData();

    Object.keys(basic).forEach((key) => {
      formData.append(`basicDetails.${key}`, basic[key] ?? '');
    });
    formData.append('basicDetails.total_amount', String(this.totalAmount || 0));
    formData.append('basicDetails.reporting_officer_code', this.officeAdminDetails.emp_code);

    formValue.treatmentDetails.forEach((row: any, index: number) => {
      const cleanedRow: any = {
        ...row,
        receipt_no: row.receipt_no || '',
        quantity: row.quantity || 0,
        rate_per_unit: row.rate_per_unit || 0,
        claim_amount: row.claim_amount || 0,
      };
      if (row.receipt_date) {
        const d = new Date(row.receipt_date);
        if (!isNaN(d.getTime())) {
          cleanedRow.receipt_date = this.toIsoDate(d);
        }
      } else {
        cleanedRow.receipt_date = this.toIsoDate(new Date());
      }
      // Treatment dates also normalised to YYYY-MM-DD for the DATE columns.
      if (row.treatment_from_date) cleanedRow.treatment_from_date = this.toIsoDate(new Date(row.treatment_from_date));
      if (row.treatment_to_date) cleanedRow.treatment_to_date = this.toIsoDate(new Date(row.treatment_to_date));
      formData.append(`treatmentDetails.${index}`, JSON.stringify(cleanedRow));
    });

    Object.keys(formValue.otherDetails).forEach((key) => {
      formData.append(`otherDetails.${key}`, formValue.otherDetails[key] ?? '');
    });

    formData.append('documents', JSON.stringify(documentsPayload));

    this.documentList.forEach((doc: any, index: number) => {
      const fileObj = this.fileStore[doc.form_control_name];
      if (fileObj) {
        formData.append(`file_${index}`, fileObj.file);
      }
    });

    this.http.postForm('/employee/postFile/saveMedicalReimbursement', formData, 'admin').subscribe(
      (res: any) => {
        const body = res.body || res;
        if (!body.error) {
          const appCode = body.data.application_code;
          this.alert
            .alertMessage('Application Submitted Successfully', `Application No: ${appCode}`, 'success')
            .then(() => {
              this.router.navigate(['/hospital/hospital-dashboard']);
            });
        } else {
          this.alert.alertMessage('Error', body?.error?.message || 'Something went wrong', 'error');
        }
      },
      (err) => {
        this.alert.alertMessage('Error', 'Server error occurred', 'error');
      },
    );
  }

  private toIsoDate(d: Date): string {
    const day = ('0' + d.getDate()).slice(-2);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }

  formatDate(date: any): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getAuthDesignationDetails() {
    let params = { ddo_code: this.DDO_CODE, designation_id: 104 };
    this.http.getParam('/stateAdmin/get/getAuthDesignationDetails', params, 'admin').subscribe((res) => {
      if (!res.body.error) {
        this.officeAdminDetails = res.body.data[0];
      } else {
        this.alert.alertMessage('Error', 'Failed to fetch office admin details', 'error');
      }
    });
  }
}
