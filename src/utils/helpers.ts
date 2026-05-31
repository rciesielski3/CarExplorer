export const formatCarName = (make: string, model: string) => {
  return `${make} ${model}`;
};

export const formatNewsDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};
