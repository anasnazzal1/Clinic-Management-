import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.use(helmet());

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:3000',
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Clinic Management System API')
    .setDescription(
      'Complete API documentation for the Clinic Management System. '
      + 'All endpoints require JWT authentication except for public auth endpoints and clinic/doctor listings.',
    )
    .setVersion('1.0.0')
    .addTag('Authentication', 'User registration, login, and email verification')
    .addTag('Users', 'User management (admin only) - create, read, update, delete users')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-Auth',
    )
    .addServer('http://localhost:3000', 'Development Server')
    .addServer('https://api.example.com', 'Production Server (not yet deployed)')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Mount Swagger outside the `api` prefix so it does not shadow REST routes (e.g. GET /api/clinics).
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
    },
    customCss: '.topbar { display: none }', // Remove unnecessary UI elements
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`\n🚀 API base URL: http://localhost:${port}/api`);
  console.log(`📚 Swagger UI: http://localhost:${port}/docs`);
  console.log(`📄 OpenAPI JSON: http://localhost:${port}/docs-json\n`);
}
bootstrap();


