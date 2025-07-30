jest.mock('@nestjs/passport', () => {
  const actual = jest.requireActual('@nestjs/passport');
  return {
    // keep everything else (e.g. PassportModule)
    ...actual,
    // AuthGuard() now returns a dummy guard that allows all requests
    AuthGuard: () =>
      class {
        canActivate() {
          return true;
        }
      },
  };
});

jest.mock('./src/auth/jwt-auth.guard', () => ({
  JwtAuthGuard: class {
    canActivate() {
      return true;
    }
  },
}));
