class CustomError extends Error {
  errCode: number;
  constructor(
    errCode: number,
    readonly message: any,
  ) {
    super(message);
    this.errCode = errCode;
  }
}

export default CustomError;
