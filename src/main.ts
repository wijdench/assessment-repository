import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // This will ensure only GraphQL is exposed
  app.setGlobalPrefix('graphql', { exclude: ['graphql'] });

  await app.listen(3000);
}
bootstrap();
