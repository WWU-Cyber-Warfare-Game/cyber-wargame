/** At least one upper case, one lower case, one digit, one special character, and at least 8 characters long. */
export const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*\-]).{8,}$/

/** Valid email address. */
export const emailRegex = /^[a-zA-Z0-9._\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}$/

/** At least 3 characters long, only letters, numbers, periods, hyphens, and underscores. */
export const usernameRegex = /^[a-zA-Z0-9._\-]{3,}$/