import { EmailAdapter } from '../adapters/email-adapter';

import { Injectable } from '@nestjs/common';
import { PasswordRecoveryModel } from '../auth/auth.types';
@Injectable()
export class EmailManager {
  constructor(private readonly emailAdapter: EmailAdapter) {}

  async sendEmailConfirmationMessage(user: any) {
    const confirmationCode = `<a href="https://some-front.com/confirm-registration?code=${user.confirmationCode}">complete registration</a>`;
    await this.emailAdapter.sendEmail(
      user.email,
      'confirmation code',
      confirmationCode,
    );
  }

  async resendEmailConfirmationMessage(refreshConfirmationData: any) {
    const confirmationCode =
      '<a href="https://some-front.com/confirm-registration?code=' +
      refreshConfirmationData.confirmationCode +
      '">complete registration</a>';
    await this.emailAdapter.sendEmail(
      refreshConfirmationData.email,
      'resending confirmation code',
      confirmationCode,
    );
  }

  async sendPasswordRecoveryMessage(
    passwordRecoveryData: PasswordRecoveryModel,
  ) {
    const passwordRecoveryCodeLink = `<a href='https://somesite.com/password-recovery?recoveryCode=${passwordRecoveryData.passwordRecoveryCode}">recovery password code</a>`;
    await this.emailAdapter.sendEmail(
      passwordRecoveryData.email,
      'password recovery code',
      passwordRecoveryCodeLink,
    );
  }
}
