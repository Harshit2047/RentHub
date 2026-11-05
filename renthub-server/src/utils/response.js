/**
 * Consistent JSON response helpers.
 * Every controller should use these instead of calling res.json() directly,
 * ensuring a uniform envelope structure across the entire API.
 */

/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {unknown} data       - Payload to return.
 * @param {string}  message    - Human-readable success message.
 * @param {number}  statusCode - HTTP status (default 200).
 */
export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string}  message    - Human-readable error message.
 * @param {number}  statusCode - HTTP status (default 500).
 * @param {unknown} errors     - Optional validation / detail errors.
 */
export const sendError = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  const body = {
    success: false,
    message,
  };
  if (errors !== null) body.errors = errors;
  return res.status(statusCode).json(body);
};

