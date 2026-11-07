import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LanguageSwitcher } from '$lib/components/ui/language-switcher';

export default function Language_switcher_variants($$anchor) {
	const languages = [
		{ code: 'en', label: 'English' },
		{ code: 'de', label: 'Deutsch' },
		{ code: 'fr', label: 'Français' },
		{ code: 'es', label: 'Español' }
	];

	let value = $.state('en');

	LanguageSwitcher($$anchor, {
		get languages() {
			return languages;
		},
		variant: 'ghost',
		align: 'start',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});
}