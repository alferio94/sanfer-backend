import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppMenuService } from './app-menu.service';
import { AppMenuController } from './app-menu.controller';
import { AppMenu } from './entities/app-menu.entity';

@Module({
  controllers: [AppMenuController],
  providers: [AppMenuService],
  imports: [TypeOrmModule.forFeature([AppMenu])],
  exports: [AppMenuService],
})
export class AppMenuModule {}