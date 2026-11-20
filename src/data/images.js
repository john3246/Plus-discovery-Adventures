// Verified Unsplash photo ids (checked visually). Build URLs with the `unsplash` Nunjucks filter.
export const IMG = {
  jeep: '1516426122078-c23e76319801',
  sunset: '1547471080-7cc2caa01a7e',
  giraffe: '1523805009345-7448845a9e53',
  rhino: '1535338454770-8be927b5a00b',
  kilimanjaro: '1489392191049-fc10c97e64b6',
  beach: '1507525428034-b723cf961d3e',
  elephantsPink: '1564760055775-d63b17a55c44',
  jetty: '1612278675615-7b093b07772d',
  elephant: '1549366021-9f761d450615',
  elephantPlains: '1521651201144-634f700b36ef',
  lions: '1504173010664-32509aeebb62',
  coast: '1547036967-23d11aacaee0',
  leopard: '1456926631375-92c8ce872def',
  zebras: '1503656142023-618e7d1f435a',
  island: '1559128010-7c1ad6e1b6a5',
  lodge: '1566073771259-6a8506099945',
};

export function unsplash(id, w = 800, h = 600) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=75`;
}
