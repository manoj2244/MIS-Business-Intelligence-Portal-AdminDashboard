export const getApiErrorMessage = (error: any, fallback = 'Something went wrong'): string => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};
