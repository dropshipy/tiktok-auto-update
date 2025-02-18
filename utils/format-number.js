export const convertToCompactFormat = (num) => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(num);
};

export const convertToFixedNumber = (number, coma) => {
  let result = "";
  result += parseFloat(number).toFixed(coma);
  return result;
};

export const convertToWhatsappNumber = (number) => {
  // Remove all characters other than numbers
  const cleanedNumber = number.replace(/\D/g, "");

  if (cleanedNumber.startsWith("0")) {
    return "62" + cleanedNumber.slice(1);
  }

  if (cleanedNumber.startsWith("62")) {
    return cleanedNumber;
  }

  return "62" + cleanedNumber;
};
