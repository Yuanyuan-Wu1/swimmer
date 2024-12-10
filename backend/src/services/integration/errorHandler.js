/**
 * API集成错误处理
 */
class IntegrationError extends Error {
  constructor(message, provider, statusCode) {
    super(message);
    this.name = 'IntegrationError';
    this.provider = provider;
    this.statusCode = statusCode;
  }
}

const handleApiError = (error, provider) => {
  if (error.response) {
    throw new IntegrationError(
      error.response.data.message,
      provider,
      error.response.status
    );
  }
  throw new IntegrationError(
    'API connection failed',
    provider,
    500
  );
}; 