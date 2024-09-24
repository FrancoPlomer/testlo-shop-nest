import { Response } from 'express';
import { diskStorage } from 'multer';

import { FilesService } from './files.service';
import { fileNamer } from './helpers/fileNamer.helper';
import { fileFilter } from './helpers/fileFilter.helper';

import { FileInterceptor } from '@nestjs/platform-express';
import { 
  Get,
  Post, 
  Controller, 
  UploadedFile, 
  UseInterceptors, 
  BadRequestException, 
  Param,
  Res
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Get('product/:imageName')
  findOne(
    // El siguiente decorador es para manejar manualmente la respuesta de la api, quitando la responsabilidad a nest
    @Res() res: Response,
    @Param('imageName')
    imageName: string
  ) {

    const path = this.filesService.getStaticProductImage( imageName );

    res.sendFile( path )
  }

  @Post('product')
  //Usamos el interceptor para corroborar que tipo de key debe tomar sobre el body para corroborar que sea un archivo
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: fileFilter,
    limits: { fileSize: 1000000 }, // 1MB
    //Ubicacion donde se van a cargar los archivos
    storage: diskStorage({
      filename: fileNamer,
      destination: './../../static/uploads'
    })
    
  }))
  uploadFile( 
    @UploadedFile()
    file: Express.Multer.File 
  ) {

    if( !file ) throw new BadRequestException('Make sure that file is valid')

    const secureUrl = `${ this.configService.get('HOST_API') }/files/product/${ file.filename }`

    return secureUrl;
  }
}
