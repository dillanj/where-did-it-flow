import { resolve } from 'node:path'

export const resolveFromWorkspace = (...segments: string[]) => {
  return resolve(process.cwd(), ...segments)
}
