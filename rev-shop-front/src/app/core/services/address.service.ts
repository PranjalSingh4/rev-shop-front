import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Address } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private addressesSubject = new BehaviorSubject<Address[]>([]);
  private nextId = 1;

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem('user_addresses');
    const maxId = localStorage.getItem('address_maxId');
    if (stored) {
      const addresses = JSON.parse(stored);
      this.addressesSubject.next(addresses);
    }
    if (maxId) {
      this.nextId = parseInt(maxId, 10);
    }
  }

  private saveToLocalStorage(addresses: Address[]): void {
    localStorage.setItem('user_addresses', JSON.stringify(addresses));
    localStorage.setItem('address_maxId', this.nextId.toString());
  }

  // Get all addresses for a customer (loads from localStorage)
  getAddresses(userId: number): Observable<Address[]> {
    const stored = localStorage.getItem('user_addresses');
    const addresses = stored ? JSON.parse(stored) : [];
    return of(addresses);
  }

  // Get a specific address
  getAddress(addressId: number): Observable<Address> {
    const addresses = this.addressesSubject.value;
    const address = addresses.find(a => a.id === addressId);
    return of(address || ({} as Address));
  }

  // Create a new address (store in localStorage only)
  createAddress(address: Omit<Address, 'id'>): Observable<Address> {
    const newAddress: Address = {
      ...address,
      id: this.nextId++
    } as Address;
    
    const current = this.addressesSubject.value;
    const updated = [...current, newAddress];
    this.addressesSubject.next(updated);
    this.saveToLocalStorage(updated);
    
    console.log('Address created and saved to UI:', newAddress);
    return of(newAddress);
  }

  // Update an address
  updateAddress(addressId: number, address: Partial<Address>): Observable<Address> {
    const current = this.addressesSubject.value;
    const index = current.findIndex(a => a.id === addressId);
    if (index >= 0) {
      current[index] = { ...current[index], ...address };
      this.addressesSubject.next(current);
      this.saveToLocalStorage(current);
    }
    return of(current[index]);
  }

  // Delete an address
  deleteAddress(addressId: number): Observable<any> {
    const current = this.addressesSubject.value;
    const updated = current.filter(a => a.id !== addressId);
    this.addressesSubject.next(updated);
    this.saveToLocalStorage(updated);
    
    console.log('Address deleted from UI:', addressId);
    return of({ success: true });
  }

  // Set default address
  setDefaultAddress(userId: number, addressId: number): Observable<Address> {
    const current = this.addressesSubject.value;
    current.forEach(a => a.isDefault = false);
    const defaultAddr = current.find(a => a.id === addressId);
    if (defaultAddr) {
      defaultAddr.isDefault = true;
    }
    this.addressesSubject.next(current);
    this.saveToLocalStorage(current);
    
    return of(defaultAddr || ({} as Address));
  }
}
