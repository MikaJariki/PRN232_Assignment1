export type Product = { id:string; name:string; description:string; price:number; image?:string; createdAt:string; updatedAt:string }
export type Paged<T> = { items:T[]; total:number; page:number; pageSize:number }
