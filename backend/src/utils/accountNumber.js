const crypto = require("crypto");

// Generates a pseudo bank-like 12-digit account number.
const generateAccountNumber = () => {
  const rand = crypto.randomInt(1_000_000_000000, 9_999_999_999999).toString();
  return rand.padStart(12, "0");
};

module.exports = { generateAccountNumber };
