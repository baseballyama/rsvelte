import * as $ from 'svelte/internal/server';
import { LanguageSwitcher } from '$lib/components/ui/language-switcher';

export default function Language_switcher_variants($$renderer) {
	const languages = [
		{ code: 'en', label: 'English' },
		{ code: 'de', label: 'Deutsch' },
		{ code: 'fr', label: 'Français' },
		{ code: 'es', label: 'Español' }
	];

	let value = 'en';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		LanguageSwitcher($$renderer, {
			languages,
			variant: 'ghost',
			align: 'start',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}