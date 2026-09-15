export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
export const isPhone = (v: string) => /^[6-9]\d{9}$/.test(v.trim())
export const isMobile = (v: string) => /^[6-9]\d{9}$/.test(v.trim())
export const isPincode = (v: string) => /^\d{6}$/.test(v.trim())
export const isOtp = (v: string) => /^\d{6}$/.test(v.trim())
export const minLen = (v: string, n: number) => v.trim().length >= n
