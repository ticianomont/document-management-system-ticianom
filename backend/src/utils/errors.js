// Erros de aplicação com status HTTP associado, evitando checagem por texto.

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

// Converte um erro em resposta HTTP consistente, usando o statusCode dos AppError.
function sendErrorResponse(error, res, fallbackMessage) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  return res.status(500).json({ message: fallbackMessage });
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  sendErrorResponse,
};
