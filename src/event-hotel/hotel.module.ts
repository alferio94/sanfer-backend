import { Module } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppEvent } from 'src/event/entities/event.entity';
import { Hotel } from './entities/hotel.entity';

@Module({
  controllers: [HotelController],
  imports: [TypeOrmModule.forFeature([Hotel, AppEvent])],
  providers: [HotelService],
})
export class HotelModule {}
