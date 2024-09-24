
export const fileFilter = ( req: Express.Request, file: Express.Multer.File, cb: Function ) => {

    // El false como segundo parametro indica que no acepto el archivo
    // Si mandamos falso termina el proceso del controlador y no deja avanzar el archivo en el servidor
    if( !file ) return cb( new Error('File is empty'), false );

    const fileExtension = file.mimetype.split('/')[1];

    const validExtensions = ['jpg', 'png', 'png', 'gif']

    if( validExtensions.includes( fileExtension ) ) return cb( null, true );

    cb( null, false );
}