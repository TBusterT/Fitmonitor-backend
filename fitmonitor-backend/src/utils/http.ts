export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const required = (body: Record<string, unknown>, fields: string[]) => {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === null || body[field] === '');
  if (missing.length > 0) {
    throw new HttpError(400, `Не заповнено обов'язкові поля: ${missing.join(', ')}`);
  }
};

export const toInt = (value: unknown, fieldName = 'id') => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new HttpError(400, `Некоректне числове поле: ${fieldName}`);
  }
  return parsed;
};

export const toDateOrUndefined = (value: unknown) => {
  if (!value) return undefined;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, 'Некоректний формат дати');
  }
  return date;
};
