export interface Product {
    id: number;
    name: string;
    nameEn?: string | null;
    price: number;
    imagePath: string;
    description?: string | null;
    descriptionEn?: string | null;
}

export interface CartItem extends Product {
    quantity: number;
    options?: string;
}
