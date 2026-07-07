import { clsx, type ClassValue } from 'clsx'

/**
 * Join class names with conditional logic.
 *
 * tailwind-merge was removed together with Tailwind itself. The app now
 * uses hand-written BEM-style class names (see app/assets/css), which
 * never conflict the way utility classes did — so plain clsx is enough.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
