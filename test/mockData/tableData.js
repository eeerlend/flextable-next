export const generatePersonData = (count) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Name ${index + 1}`,
    email: `email${index + 1}@example.com`,
  }));
};
