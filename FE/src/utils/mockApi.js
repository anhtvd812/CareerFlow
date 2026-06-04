export const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

export const clone = (value) => JSON.parse(JSON.stringify(value));
