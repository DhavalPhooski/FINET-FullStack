export function calcEMI(p, r, n) {
  return (p * r * (1+r)**n) / ((1+r)**n - 1);
}
