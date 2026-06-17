const dateStringRegex = /^\d{4}-\d{2}-\d{2}$/;

export interface ValidationErrors {
  birthDate?: string;
  birthPlace?: string;
  inviteCode?: string;
}

export function validateBirthForm(data: {
  birthDate: string;
  birthPlace: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!data.birthDate) {
    errors.birthDate = '请选择出生日期';
  } else if (!dateStringRegex.test(data.birthDate)) {
    errors.birthDate = '日期格式错误';
  }
  if (!data.birthPlace) {
    errors.birthPlace = '请输入出生地点';
  }
  return errors;
}

export function validateInviteCode(code: string): string | null {
  const trimmed = code.trim();
  if (!trimmed) return '请输入邀请码';
  if (!/^u_\d+$/.test(trimmed)) return '邀请码格式错误，应为 u_ 加数字（如 u_12345）';
  return null;
}
