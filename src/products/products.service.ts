import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid'; 
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';

@Injectable()
export class ProductsService {

  //Este es el sistema propio de loggers de nest
  private readonly logger = new Logger()


  //Esta invocacion al entity es a traves del patron repositorio
  //Sirve para injectar, hacer query builders, transacciones, rollbacks, etc...
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ){}
  
  async create(createProductDto: CreateProductDto) {
    try {
      
      // Esto no hace la insercion en base, sino que crea la instancia del producto con las propiedades definidas del entity
      const product = this.productRepository.create(createProductDto)
      
      // Aqui hacemos la insercion en base
      await this.productRepository.save(product)

      return product;
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  findAll(paginationDto: PaginationDto) {
    
    const { limit = 10, offset = 0 } = paginationDto;
    
    return this.productRepository.find({
      take: limit, 
      skip: offset
    });
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
              ).getOne();
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

    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    });

    if(!product) throw new NotFoundException(`Product whit ${id} not found`);

    try {
      return this.productRepository.save(product);
    } catch (error) {
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
}
