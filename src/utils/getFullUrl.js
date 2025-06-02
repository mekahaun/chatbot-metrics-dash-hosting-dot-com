const getFullUrl = (path) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const fullUrl = `${baseUrl}${path}`;
  return fullUrl;
};

export default getFullUrl;
