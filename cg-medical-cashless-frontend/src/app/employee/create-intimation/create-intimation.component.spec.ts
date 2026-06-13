import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateIntimationComponent } from './create-intimation.component';

describe('CreateIntimationComponent', () => {
  let component: CreateIntimationComponent;
  let fixture: ComponentFixture<CreateIntimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateIntimationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateIntimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
