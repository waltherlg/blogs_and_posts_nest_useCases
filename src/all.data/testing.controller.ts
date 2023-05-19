import {
  BadRequestException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { TestingService } from './test.service';
import { AppService } from '../app.service';
import { CustomisableException } from '../exceptions/custom.exceptions';

@Controller('testing')
export class TestingController {
  constructor(
    private readonly appService: AppService,
    private readonly testingService: TestingService,
  ) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAllData() {
    return await this.testingService.deleteAllData();
  }

  @Get('customisableException400')
  async CustomisableException400() {
    throw new CustomisableException(
      'testing exception',
      'CustomisableException with code 400',
      400,
    );
  }
  @Get('customisableException401')
  async CustomisableException401() {
    throw new CustomisableException(
      'testing exception',
      'CustomisableException with code 401',
      401,
    );
  }
  @Get('BadRequestException')
  async BadRequestException() {
    throw new BadRequestException('testing error');
  }
  @Get('UnauthorizedException')
  async UnauthorizedException() {
    throw new UnauthorizedException('testing error');
  }
  @Get('ForbiddenException')
  async ForbiddenException() {
    throw new ForbiddenException('testing error');
  }
  @Get('NotFoundException')
  async NotFoundException() {
    throw new NotFoundException();
  }
}
