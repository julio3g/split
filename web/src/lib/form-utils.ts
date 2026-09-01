/** Converte campos string vazios ('') pra undefined, pra bater com optional() do zod no backend. */
export function cleanOptionalStrings<T extends Record<string, unknown>>(
  data: T
): T {
  const result = { ...data }
  for (const key in result) {
    if (result[key] === '') {
      result[key] = undefined as T[typeof key]
    }
  }
  return result
}
