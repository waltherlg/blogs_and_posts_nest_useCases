import { Injectable } from '@nestjs/common';
import { TestRepository } from './test.repository';

@Injectable()
export class TestingService {
  constructor(private readonly testRepository: TestRepository) {}
  async deleteAllData(): Promise<boolean> {
    return await this.testRepository.deleteAllData();
  }
}
