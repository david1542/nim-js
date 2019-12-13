
export const calculateNimSum = (formation) => {
  return formation.map(group => group.length)
    .reduce((total, group) => {
      total ^= group;
      return total;
    });
};
export const getWinningGroupIndex = formation => {
  const nimSum = calculateNimSum(formation);
  return formation.findIndex(group => {
    const groupNimSum = group.length ^ nimSum;
    return groupNimSum < group.length;
  });
};
