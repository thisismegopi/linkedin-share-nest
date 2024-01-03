import { Module } from '@nestjs/common';
import { LinkedinService } from './linkedin.service';
import { LinkedinController } from './linkedin.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports:[HttpModule],
  providers: [LinkedinService],
  controllers: [LinkedinController]
})
export class LinkedinModule {}
