import * as $ from 'svelte/internal/server';
import { LanguageSwitcher } from '$lib/components/ui/language-switcher';
import { getLocale, setLocale, locales as availableLocales, isLocale } from '$lib/paraglide/runtime';
import { m } from '$lib/paraglide/messages.js';

export default function Language_switcher_paraglide($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const languageLabels = { en: 'English', de: 'Deutsch', fr: 'Français'

		// Add labels for all your configured locales in project.inlang/settings.json
		 };

		const languages = availableLocales.map((code) => ({ code, label: languageLabels[code] ?? code.toUpperCase() }));
		let currentLang = $.derived(getLocale);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex flex-col items-center gap-4">`);

			LanguageSwitcher($$renderer, {
				languages,
				onChange: (code) => {
					if (isLocale(code)) setLocale(code);
				},

				get value() {
					return currentLang();
				},

				set value($$value) {
					currentLang($$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h3>${$.escape(m.example_message())}</h3></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}