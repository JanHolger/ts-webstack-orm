export default class StringUtil {
    public static isUpperCase(c: string): boolean {
        return c.toUpperCase() == c
    }
    public static isLowerCase(c: string): boolean {
        return c.toLowerCase() == c
    }
    public static capitalize(src: string): string {
        return src[0].toUpperCase() + src.substring(1)
    }
    public static caseWords(src: string): string[] {
        const words = []
        let current = src[0]
        for(let i=1; i<src.length; i++) {
            if(src[i] == '_' || src[i] == '-') {
                if(current.length > 0) {
                    words.push(current.toLowerCase())
                    current = ''
                }
            }
            if(StringUtil.isUpperCase(src[i])) {
                if(current.length > 0) {
                    words.push(current.toLowerCase())
                    current = ''
                }
            }
            current += src[i]
        }
        if(current.length > 0) {
            words.push(current.toLowerCase())
        }
        return words
    }
    public static snakeCase(src: string): string {
        return StringUtil.caseWords(src).join('_')
    }
    public static camelCase(src: string): string {
        return StringUtil.caseWords(src).map((w, i) => i == 0 ? w : StringUtil.capitalize(w)).join('')
    }
    public static englishPlural(singular: string) {
        return singular + 's'
    }
}