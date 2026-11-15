const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parts(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d };
}

export function fmtRange(start, end) {
  const a = parts(start);
  const b = parts(end || start);
  if (a.y === b.y && a.m === b.m && a.d === b.d) return `${M[a.m - 1]} ${a.d}, ${a.y}`;
  if (a.y === b.y && a.m === b.m) return `${M[a.m - 1]} ${a.d}–${b.d}, ${a.y}`;
  if (a.y === b.y) return `${M[a.m - 1]} ${a.d} – ${M[b.m - 1]} ${b.d}, ${a.y}`;
  return `${M[a.m - 1]} ${a.d}, ${a.y} – ${M[b.m - 1]} ${b.d}, ${b.y}`;
}
