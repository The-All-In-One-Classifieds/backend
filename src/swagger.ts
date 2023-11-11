import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        version: 'v1.0.0',
        title: 'Backend for BidIt',
        description: 'Swagger in backend of BidIt, All in one classifieds'
    },
    servers: [
        {
            url: 'http://localhost:2339',
            description: ''
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
            }
        }
    }
};

const outputFile = './docs/swagger.json';
const endpointsFiles = ['./routes/index.ts'];

swaggerAutogen({openapi: '3.0.0'})(outputFile, endpointsFiles, doc);
