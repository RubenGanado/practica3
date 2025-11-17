import { ObjectId } from "mongodb"

type User = {
    _id?: ObjectId,
    username: string,
    email : string,
    passwordHash: string,
    createdAt: Date
}

type Products = {
    _id?: ObjectId,
    name: string,
    description: string,
    price: number,
    stock: number,
    createdAt: Date
}

type Carts = {
    _id?: ObjectId,
    userId: ObjectId,
    items: { productId: ObjectId, quantity: number }[]
}

type JwtPayload = {
    UserId: string;
    
}

export { User, Products, Carts, JwtPayload };