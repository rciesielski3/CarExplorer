export const getCarImagesFallbackUrl = ({
  make,
  model,
  year,
}: {
  make: string;
  model?: string;
  year?: string | null;
}) => {
  const query = new URLSearchParams({
    type: "car",
    make,
    width: "800",
    format: "webp",
  });

  if (model) {
    query.set("model", model);
  }

  if (year) {
    query.set("year", year);
  }

  return `https://carimagesapi.com/image?${query.toString()}`;
};
