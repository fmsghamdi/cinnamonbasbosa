import { cookies } from 'next/headers'
import { translations, Language } from '@/translations'

export async function getServerLanguage() {
    const cookieStore = await cookies()
    const lang = (cookieStore.get('NEXT_LOCALE')?.value as Language) || 'ar'

    const t = (path: string): string => {
        const keys = path.split('.');
        let current: any = translations[lang];
        for (const key of keys) {
            if (current === undefined || current[key] === undefined) {
                let fallback: any = translations['ar'];
                for (const fbKey of keys) {
                    if (fallback === undefined || fallback[fbKey] === undefined) return path;
                    fallback = fallback[fbKey];
                }
                return fallback as string;
            }
            current = current[key];
        }
        return current as string;
    };

    return { t, language: lang }
}
