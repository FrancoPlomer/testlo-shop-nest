import { ProductImage } from "./product-image.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    
    title: string;

    @Column('float', {
        default: 0
    })
    price: number;

    //El tipo de dato tambien puede definirse asi
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @Column('text', {
        unique: true,
    })
    slug: string;

    @Column('int', {
        default: 0
    })
    stock: number;

    @Column('text', {
        array: true,
    })
    sizes: string[];

    @Column('text')
    gender: string;

    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        //La siguiente propiedad es para que, si borramos una imagen de un producto, se borren las demas
        { 
            cascade: true,
            eager: true 
        }
    )
    images?: ProductImage[]

    @BeforeInsert()
    @BeforeUpdate()
    checkSlugInsert() {

        if( !this.slug ) {
            this.slug = this.title
        }
        if(Array.isArray(this.tags)) {
            this.tags = [`${this.tags}`]
        }

        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '')
    }
}
