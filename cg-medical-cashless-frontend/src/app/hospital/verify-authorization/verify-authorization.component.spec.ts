import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyAuthorizationComponent } from './verify-authorization.component';

describe('VerifyAuthorizationComponent', () => {
  let component: VerifyAuthorizationComponent;
  let fixture: ComponentFixture<VerifyAuthorizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyAuthorizationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerifyAuthorizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
