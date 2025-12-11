import { twMerge } from 'tailwind-merge'

export function cn(...inputs: (string | undefined | null | false | Record<string, any>)[]): string {
  const classes = inputs
    .flat()
    .filter((x): x is string | Record<string, any> => Boolean(x))
    .map(item => {
      if (typeof item === 'string') return item
      if (typeof item === 'object' && item !== null) {
        return Object.keys(item)
          .filter(key => (item as Record<string, any>)[key])
          .join(' ')
      }
      return ''
    })
    .join(' ')

  return twMerge(classes)
}
