export interface Details {
    productId: number;
    productName: string;
    quantity: number;
}

export interface Order {
    name: string;
    shippingAddress: string;
    city: string;
    isDelivery: boolean;
    id: number;
}

export interface DetailsOrder {
    details: Details[];
    orderId: number;
}