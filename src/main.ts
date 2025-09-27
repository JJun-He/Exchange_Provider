import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";


async function bootstrap(){
    const app = await NestFactory.create(AppModule);

    // 기본 설정 유지
    app.useGlobalPipes(new ValidationPipe({
        transform: true, // 요청 데이터를 DTO 클래스 인스턴스로 변환
        whitelist: true, // DTO에 정의되지 않은 필드 자동 제거
        forbidNonWhitelisted: true, // DTO에 없는 필드 발견 시 에러 발생
        stopAtFirstError: true, // 첫번째 검증 에러에서 중단
        transformOptions:{
            enableImplicitConversion: true, // 기본 타입 자동 변환 활성화
        }
    }));
    app.setGlobalPrefix('api/v1');
    app.enableCors();

    // Swagger 설정
    const config = new DocumentBuilder()
    .setTitle('Crypto Provider API')
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