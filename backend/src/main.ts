import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 配置静态资源
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  // 设置全局前缀
  app.setGlobalPrefix('api');

  // 全局参数检验
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  // 全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(3001);
  console.log('Server is running on http://localhost:3001');
}
bootstrap();
