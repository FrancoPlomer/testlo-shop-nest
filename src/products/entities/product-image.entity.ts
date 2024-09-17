import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class ProductImage {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    @ManyToOne(
        () => Product,
        product => product.images, {
            // Lo siguiente lo hacemos para que, si se borra un producto, por relacion tambien se borren las imagenes de la tabla imagenes
            onDelete: 'CASCADE'
        }
    )
    product: Product
}