export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
  isVerified: boolean;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = {
  user: PublicUser;
  tokens: AuthTokens;
};

