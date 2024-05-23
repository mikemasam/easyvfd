import { DateTime } from "luxon";

export const dateValidator = (format: string) => (value: string) => {
  if (typeof value !== 'string') {
    return {
      message: 'Invalid date format',
    };
  }
  if (!DateTime.fromFormat(value, format).isValid) {
    return {
      message: 'Invalid date format',
    };
  }
  return true;
};
