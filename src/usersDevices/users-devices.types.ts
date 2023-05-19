import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
export class UserDeviceDBType {
  constructor(
    public _id: Types.ObjectId,
    public userId: string,
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    public expirationDate: string,
  ) {}
}

export type UserDeviceOutputType = {
  ip: string;
  title: string | unknown | null;
  lastActiveDate: string;
  deviceId: string;
};
export type UsersDeviceDocument = HydratedDocument<UsersDevice>;
@Schema()
export class UsersDevice {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: Types.ObjectId;
  @Prop()
  userId: string;
  @Prop()
  ip: string;
  @Prop()
  title: string;
  @Prop()
  lastActiveDate: string;
  @Prop()
  expirationDate: string;
  prepareUsersDeviceForOutput() {
    return {
      ip: this.ip,
      title: this.title,
      lastActiveDate: this.lastActiveDate,
      deviceId: this._id.toString(),
    };
  }
}

export const UsersDeviceSchema = SchemaFactory.createForClass(UsersDevice);
UsersDeviceSchema.methods = {
  prepareUsersDeviceForOutput:
    UsersDevice.prototype.prepareUsersDeviceForOutput,
};
