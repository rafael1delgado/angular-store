import { Component, OnInit } from '@angular/core';
import { ProductsService } from './services/products.service';
import { tap } from 'rxjs/operators';
import { Product } from './interfaces/product.interface';
import { ShoopingCartService } from 'src/app/shared/services/shopping-cart.services';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  products!: Product[];

  constructor(private productSvc: ProductsService, private shoppingCartSvc: ShoopingCartService) { }

  ngOnInit(): void {
    this.productSvc.getProducts()
    .pipe(
      tap( (products: Product[]) => this.products = products)
    )
    .subscribe();
  }

  addToCart(product: Product):void {
    console.log('Add to cart', product);
    this.shoppingCartSvc.updateCart(product);
  }

}
