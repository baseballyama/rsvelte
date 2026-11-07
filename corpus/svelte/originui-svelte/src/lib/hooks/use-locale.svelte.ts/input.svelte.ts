import { getContext, setContext } from 'svelte';

const LOCALE_CONTEXT_KEY = Symbol('ctx:locale');
interface LocaleOptions {
	locale?: string;
}

export class LocaleManager {
	#locale = $state<string>('');

	constructor(options: LocaleOptions = {}) {
		this.#locale = options.locale ?? getDefaultLocale();
	}

	get locale(): string {
		return this.#locale;
	}

	set locale(value: string) {
		this.#locale = value;
	}
}

export function useLocale(options: LocaleOptions = {}): LocaleManager {
	const contextLocale = getContext<LocaleManager | undefined>(LOCALE_CONTEXT_KEY);

	if (contextLocale) {
		return contextLocale;
	}

	const localeManager = new LocaleManager(options);
	setContext(LOCALE_CONTEXT_KEY, localeManager);

	return localeManager;
}

function getDefaultLocale(): string {
	if (typeof navigator !== 'undefined' && navigator.language) {
		return navigator.language;
	}
	return 'en-US';
}
