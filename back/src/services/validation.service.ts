export const asyncValidation = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        valid: true,
        message: "Validation terminée"
      });
    }, 2000);
  });
};