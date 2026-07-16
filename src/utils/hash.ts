import crypto from "crypto";

/**
 * 비밀번호를 PBKDF2 알고리즘으로 안전하게 해싱합니다.
 * @param password 평문 비밀번호
 * @returns salt:hash 형태의 문자열
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * 평문 비밀번호가 저장된 해시 비밀번호와 일치하는지 검증합니다.
 * @param password 평문 비밀번호
 * @param storedHash DB에 저장된 salt:hash 형태의 해시값
 * @returns 일치 여부 (boolean)
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(":");
    if (!salt || !originalHash) {
      return false;
    }
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === originalHash;
  } catch (err) {
    console.error("Password verification error:", err);
    return false;
  }
}
