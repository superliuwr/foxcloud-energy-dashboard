import { timingSafeEqual } from "node:crypto";

export interface DashboardCredential {
  username: string;
  password: string;
}

export const parseBasicAuthHeader = (
  authorizationHeader: string | undefined,
): DashboardCredential | null => {
  const encodedCredentials = authorizationHeader?.match(/^Basic\s+(.+)$/i)?.[1];

  if (!encodedCredentials) {
    return null;
  }

  const decodedCredentials = Buffer.from(encodedCredentials, "base64").toString("utf8");
  const separatorIndex = decodedCredentials.indexOf(":");

  if (separatorIndex < 0) {
    return null;
  }

  return {
    username: decodedCredentials.slice(0, separatorIndex),
    password: decodedCredentials.slice(separatorIndex + 1),
  };
};

export const safeEqual = (first: string, second: string): boolean => {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer);
};

export const hasMatchingCredential = (
  credentials: DashboardCredential[],
  username: string,
  password: string,
): boolean => {
  return credentials.some(
    (credential) =>
      safeEqual(username, credential.username) && safeEqual(password, credential.password),
  );
};
