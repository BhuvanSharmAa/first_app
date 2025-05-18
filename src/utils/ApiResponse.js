class ApiResponse {
  constructor(status, message, data) {
    this.status = status;
    this.message = message;
    this.data = data;
  }

  static success(data) {
    return new ApiResponse(200, 'Success', data);
  }

  static error(message) {
    return new ApiResponse(500, message, null);
  }
}

export  { ApiResponse };
