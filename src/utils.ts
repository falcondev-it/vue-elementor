export function toKebabCase(str: string) {
  return str
    .replace(/^[a-z]/i, letter => letter.toLowerCase())
    .replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
}
