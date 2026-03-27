import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
    .addServer('http://localhost:3001', 'Development Server')
    .addServer('https://api.example.com', 'Production Server (not yet deployed)')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
    },
    customCss: '.topbar { display: none }', // Remove unnecessary UI elements
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`\n🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation available at: http://localhost:${port}/api`);
  console.log(`📄 OpenAPI JSON available at: http://localhost:${port}/api-json\n`);
}
bootstrap();


