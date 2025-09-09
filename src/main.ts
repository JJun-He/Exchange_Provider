import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";


async function bootstrap(){
    const app = await NestFactory.create(AppModule);

    // 기본 설정 유지
    app.useGlobalPipes(new ValidationPipe({transform: true}));
    app.setGlobalPrefix('api/v1');
    app.enableCors();

    // Swagger 설정
    const config = new DocumentBuilder()
    .setTitle('Cypto Provider API')
    .setDescription('Multi-exchange cryptocurrency price provider')
    .setVersion('1.0')
    .addTag('Price', 'Price provider endpoints')
    .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true
        }
    });

    await app.listen(3000);
    console.log("Service running on http://localhost:3000");
}

bootstrap();