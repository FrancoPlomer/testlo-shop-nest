import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid'; 
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {

  //Este es el sistema propio de loggers de nest
  private readonly logger = new Logger()


  //Esta invocacion al entity es a traves del patron repositorio
  //Sirve para injectar, hacer query builders, transacciones, rollbacks, etc...
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    
    // Lo siguiente contiene la informacion sobre la cadena de conexion a la base de datos, tales como usuarios, tablas, relaciones, etc...
    private readonly dataSource: DataSource,
  ){}
  
  async findOnePlain(  term: string ) {

    const { images, ...rest } = await this.findOne( term )
  
    return {
      ...rest,
      images: images.map( img => img.url )
    }
  }

  async create(createProductDto: CreateProductDto) {
    try {
      
      // Esto no hace la insercion en base, sino que crea la instancia del producto con las propiedades definidas del entity
      
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => (
          this.productImageRepository.create({ url: image }) 
        ))
      })
      
      // Aqui hacemos la insercion en base
      await this.productRepository.save(product)

      return { ...product, images };
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    
    const { limit = 10, offset = 0 } = paginationDto;
    
    const products = await this.productRepository.find({
      take: limit, 
      skip: offset,
      relations: {
        images: true
      }
    });

    return products.map( ({ images, ...rest }) => ({
      ...rest,
      images: images.map( img => img.url )
    }));
  }

  async findOne(term: string) {
    try {
      
      const product: Product = (
        await (
          isUUID(term) ? 
          this.productRepository.findOneBy({ id: term }) : (
          () => {
              
              const queryBuilder = this.productRepository.createQueryBuilder();
              
              return queryBuilder.where(
                'UPPER(title) =:title or slug =:slug', {
                  title: term.toUpperCase(),
                  slug: term.toLowerCase()
                }
              )
              .leftJoinAndSelect('prod.images', 'prodImages')
              .getOne();
            }
          )()
        )
      );

      return product;
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    // Le indicamos a TypeORM que busque un producto por el id y que cargue las propiedades del updateProductDto
    // No lo actualiza, lo prepara para la actualización
    const { images, ...toUpdated } = updateProductDto;

    const product = await this.productRepository.preload({
      id: id,
      ...toUpdated
    });

    if(!product) throw new NotFoundException(`Product whit ${id} not found`);

    // Create query runner

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {

      if( images ) {

        // Lo siguiente borra todas las imagenes en la tabla de imagenes a traves de la relacion, la cual es el id del producto
        // delete * from images where productId = id
        await queryRunner.manager.delete(
          ProductImage, {
            product: {
              id
            }
          }
        );

        product.images = images.map(
          image => this.productImageRepository.create({ 
            url: image 
          })
        );
      }

      // Si todo sale bien hasta aqui guarda la informacion
      await queryRunner.manager.save( product );

      // Por ultimo hacemos commit de la transacción
      await queryRunner.commitTransaction();

      // Publicamos dicho commit
      await queryRunner.release();

      return this.findOnePlain( id );
    } catch (error) {

      // En caso de que algo fallara durante el queryRunner aqui vamos a hacer el rollback para evitar inconsistencia de datos
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      this.handleExceptions(error);
    }
  }

  remove(id: string) {
    return this.productRepository.delete(id);
  }

  private handleExceptions(error: any) {

    if( error.code === '23505' ) throw new BadRequestException(error.detail);

    this.logger.error(error)

    throw new InternalServerErrorException('Unexpected error, check server logs!')
  }

  async deleteAllProducts() {
    
    const query = this.productRepository.createQueryBuilder('product')

    try {
      
      return (
        await query
        .delete()
        .where({})
        .execute()
      )
    } catch (error) {
      this.handleExceptions(error)
    }
  }
}
