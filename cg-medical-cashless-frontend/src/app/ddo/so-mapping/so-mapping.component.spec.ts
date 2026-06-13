import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoMappingComponent } from './so-mapping.component';

describe('SoMappingComponent', () => {
  let component: SoMappingComponent;
  let fixture: ComponentFixture<SoMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoMappingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SoMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
