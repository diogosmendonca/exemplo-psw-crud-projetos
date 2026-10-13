/**
 * Banco → API: troca `_id` (ObjectId) por `id` (texto), colocado como primeiro
 * campo. Usada como `transform` do `toJSON`/`toObject` dos schemas.
 */
export function paraApi(_documento, objeto) {
  const { _id, ...campos } = objeto
  return { id: String(_id), ...campos }
}
