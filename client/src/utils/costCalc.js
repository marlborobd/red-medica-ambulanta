export function calculateCost(distance_km, trip_type, tariff) {
  if (!tariff || !distance_km) return 0;
  const base = parseFloat(distance_km) * parseFloat(tariff.price_per_km);
  let surcharge = 0;
  if (trip_type === 'urgenta') surcharge = parseFloat(tariff.surcharge_urgenta);
  else if (trip_type === 'nocturna') surcharge = parseFloat(tariff.surcharge_nocturna);
  else if (trip_type === 'aparatura') surcharge = parseFloat(tariff.surcharge_aparatura);
  return parseFloat((base + (base * surcharge) / 100).toFixed(2));
}

export function getSurchargePct(trip_type, tariff) {
  if (!tariff) return 0;
  if (trip_type === 'urgenta') return parseFloat(tariff.surcharge_urgenta);
  if (trip_type === 'nocturna') return parseFloat(tariff.surcharge_nocturna);
  if (trip_type === 'aparatura') return parseFloat(tariff.surcharge_aparatura);
  return 0;
}
