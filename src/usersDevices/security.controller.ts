import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersDevicesRepository } from './usersDevicesRepository';
import { RefreshTokenGuard } from '../auth/guards/refreshToken.guard';
import { UsersDeviceService } from './users-devices.service';
import {
  CustomisableException,
  CustomNotFoundException,
  UnableException,
} from '../exceptions/custom.exceptions';
import { CheckService } from '../other.services/check.service';

@Controller('security')
export class SecurityController {
  constructor(
    private readonly usersDeviceRepository: UsersDevicesRepository,
    private readonly usersDeviceService: UsersDeviceService,
    private readonly checkService: CheckService,
  ) {}

  @UseGuards(RefreshTokenGuard)
  @Delete('devices')
  @HttpCode(204)
  async terminateAllOtherDeviceSession(@Req() request) {
    const isAllUsersDevisesDeleted =
      await this.usersDeviceService.deleteAllUserDevicesExceptCurrent(
        request.user,
      );
    if (!isAllUsersDevisesDeleted) {
      throw new UnableException('terminating All Other Device Session');
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Get('devices')
  async devices(@Req() request) {
    const usersDevises = await this.usersDeviceService.getActiveUserDevices(
      request.user.userId,
    );
    if (!usersDevises) {
      throw new UnableException('get devices');
    }
    return usersDevises;
  }
  @UseGuards(RefreshTokenGuard)
  @Delete('devices/:deviceId')
  @HttpCode(204)
  async terminateDeviceSession(@Req() request, @Param('deviceId') deviceId) {
    if (!(await this.checkService.isUserDeviceExist(deviceId))) {
      throw new CustomNotFoundException('deviceId');
    }
    if (
      !(await this.checkService.isUserOwnerOfDevice(
        request.user.userId,
        deviceId,
      ))
    ) {
      throw new CustomisableException(
        'you are not owner',
        'you can terminate only yours device session',
        403,
      );
    }
    const isDeviceDeleted =
      await this.usersDeviceService.deleteDeviceByUserAndDeviceId(
        request.user.userId,
        deviceId,
      );
    if (!isDeviceDeleted) {
      throw new UnableException('terminating device session');
    }
  }
}
