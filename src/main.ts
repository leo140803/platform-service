import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Create the HTTP server
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Create the TCP microservice
  const microservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 3001,
      },
    });

  // Start both the HTTP server and the TCP microservice
  await app.listen(3001); // HTTP on port 3000
  await microservice.listen(); // TCP on port 3001

  console.log('HTTP server is running on port 3001');
  console.log('TCP subscriber is running on port 3001');
}
bootstrap();
