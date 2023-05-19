import { Transform } from 'class-transformer';

export function Trim(): PropertyDecorator {
  return Transform(({ value }) => value?.replace(/\s+/g, ' ').trim());
}
