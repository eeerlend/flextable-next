export const generatePersonData = (count) => {
  let counter = 0;
  const data = Array.from({ length: count }, (_, index) => {
    counter++;
    return {
      id: counter,
      name: `Name ${counter}`,
      email: `email${counter}@example.com`,
    };
  });

  return [
    ...data,
    { id: counter + 1, name: "Erlend", email: "erlend@example.com" },
  ];
};
