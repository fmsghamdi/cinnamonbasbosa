export interface Product {
    id: number;
    name: string;
    price: number;
    imagePath: string;
    description?: string | null;
}

export interface CartItem extends Product {
    quantity: number;
    options?: string;
}
