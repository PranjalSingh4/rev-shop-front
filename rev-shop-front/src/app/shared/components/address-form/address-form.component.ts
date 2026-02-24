import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Address } from '../../../core/models';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.css']
})
export class AddressFormComponent implements OnInit {
  @Input() address?: Address;
  @Input() isLoading = false;
  @Output() submit = new EventEmitter<Omit<Address, 'id'>>();
  @Output() cancel = new EventEmitter<void>();

  addressForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.addressForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      streetAddress: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{4,10}$/)]],
      country: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]]
    });
  }

  ngOnInit(): void {
    if (this.address) {
      this.addressForm.patchValue({
        fullName: this.address.fullName,
        streetAddress: this.address.streetAddress,
        city: this.address.city,
        state: this.address.state,
        postalCode: this.address.postalCode,
        country: this.address.country,
        phoneNumber: this.address.phoneNumber
      });
    }
  }

  onSubmit(): void {
    if (this.addressForm.valid) {
      const formValue = this.addressForm.value;
      this.submit.emit({
        userId: 0, // Will be set by parent component
        ...formValue
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.addressForm.get(fieldName);
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (control.errors['minlength']) {
      return `${fieldName} must be at least ${control.errors['minlength'].requiredLength} characters`;
    }
    if (control.errors['pattern']) {
      if (fieldName === 'postalCode') {
        return 'Postal code must be 4-10 digits';
      }
      if (fieldName === 'phoneNumber') {
        return 'Phone number must be 10-15 digits';
      }
    }
    return 'Invalid input';
  }
}
