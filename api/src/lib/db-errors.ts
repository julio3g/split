function hasCode(value: unknown): value is { code: string } {
  return typeof value === 'object' && value !== null && 'code' in value
}

export function isForeignKeyViolation(err: unknown): boolean {
  if (hasCode(err) && err.code === '23503') {
    return true
  }

  const cause = err instanceof Error ? err.cause : undefined
  return hasCode(cause) && cause.code === '23503'
}
