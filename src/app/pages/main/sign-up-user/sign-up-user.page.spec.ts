import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignUpUserPage } from './sign-up-user.page';

describe('SignUpUserPage', () => {
  let component: SignUpUserPage;
  let fixture: ComponentFixture<SignUpUserPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpUserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
