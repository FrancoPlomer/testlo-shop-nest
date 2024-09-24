import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';

import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { CommonModule } from './common/common.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
  
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      // La siguiente es para cargar automaticamente las entidades que vamos definiendo
      autoLoadEntities: true,
      // Este ultimo sirve para que, si creamos un cambio en nuestras entidades, automaticamente lo sincronice
      // Esto no queres que se haga en produccion
      synchronize: true
    }),
  
    ProductsModule,
  
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    }),

    CommonModule,
  
    SeedModule,
  
    FilesModule
  ],
})
export class AppModule {}
