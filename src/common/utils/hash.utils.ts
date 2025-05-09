// hash.util.ts
import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  raw: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(raw, hash);
};
