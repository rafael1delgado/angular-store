import { Component, OnInit } from '@angular/core';
import { DataServices } from 'src/app/shared/services/data.services';
import { delay, switchMap, tap } from 'rxjs/operators';
import { Store } from 'src/app/shared/interfaces/stores.interfaces';
import { NgForm } from '@angular/forms';
import { Details } from 'src/app/shared/interfaces/order.interface';
import { Product } from '../products/interfaces/product.interface';
import { ShoopingCartService } from 'src/app/shared/services/shopping-cart.services';
import { Router } from '@angular/router';
import { ProductsService } from '../products/services/products.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  model = {
    name: '',
    store: '',
    shippingAddress: '',
    city: '',
  };
  
  cart: Product[] = [];

  isDelivery = true;

  stores: Store[] = [];

  constructor(
    private dataSvc: DataServices,
    private shoppingCartSvc: ShoopingCartService,
    private router: Router,
    private productSvc: ProductsService) {
      this.checkIfCartIsEmpty();
    }

  ngOnInit(): void {
    this.getStores();
    this.getDataCart();
    this.prepareDetails();
  }

  onPickupOrDelivery(value: boolean): void {
    this.isDelivery = value; 
  }

  onSubmit({value: formData}: NgForm): void {
    console.log(formData);
    const data = {
      ...formData,
      date: this.getCurrentDay,
      isDelivery: this.isDelivery,
    }
    this.dataSvc.saveOrder(data)
    .pipe(
      tap( res => console.log('Order =>', res)),
      switchMap(({id: orderId}) => {
        const details = this.prepareDetails();
        return this.dataSvc.saveDetailsOrder({details, orderId});
      }),
      tap( res => this.router.navigate(['/checkout/thank-you-page'])),
      delay(2000),
      tap( () => this.shoppingCartSvc.resetCart() ),
    )
    .subscribe()
    
  }

  private getCurrentDay(): string {
    return new Date().toLocaleDateString();
  }

  private getStores(): void {
    // Todo: 
    this.dataSvc.getStores()
    .pipe(
      tap( (stores: Store[]) => this.stores = stores ) 
    )
    .subscribe()
  }

  private prepareDetails(): Details[] {
    const details : Details[] = [];
    this.cart.forEach((product: Product) => {
      const {id: productId, name: productName, qty: quantity, stock} = product;
      const updateStock = (stock - quantity);

      this.productSvc.updateStock(productId, updateStock)
      .pipe(
        tap( res => details.push({productId, productName, quantity}))
      )
      .subscribe()

      
    })
    return details;
  }

  private getDataCart(): void {
    this.shoppingCartSvc.cartAction$
    .pipe(
      tap( (products: Product[]) => this.cart = products )
    )
    .subscribe()
  }

  private checkIfCartIsEmpty(): void {
    this.shoppingCartSvc.cartAction$
    .pipe(
      tap( (products: Product[]) => {
        if(Array.isArray(products) && !products.length) {
          this.router.navigate(['/products']);
        }
      })
    )
    .subscribe()
  }
}
