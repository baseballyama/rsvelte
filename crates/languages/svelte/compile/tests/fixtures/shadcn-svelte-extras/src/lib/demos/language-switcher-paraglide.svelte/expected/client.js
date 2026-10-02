import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LanguageSwitcher } from '$lib/components/ui/language-switcher';
import { getLocale, setLocale, locales as availableLocales, isLocale } from '$lib/paraglide/runtime';
import { m } from '$lib/paraglide/messages.js';

var root = $.from_html(`<div class="flex flex-col items-center gap-4"><!> <h3> </h3></div>`);

export default function Language_switcher_paraglide($$anchor, $$props) {
	$.push($$props, true);

	const languageLabels = { en: 'English', de: 'Deutsch', fr: 'Français'

	// Add labels for all your configured locales in project.inlang/settings.json
	 };

	const languages = availableLocales.map((code) => ({ code, label: languageLabels[code] ?? code.toUpperCase() }));
	let currentLang = $.derived(getLocale);
	var div = root();
	var node = $.child(div);

	LanguageSwitcher(node, {
		get languages() {
			return languages;
		},

		onChange: (code) => {
			if (isLocale(code)) setLocale(code);
		},

		get value() {
			return $.get(currentLang);
		},

		set value($$value) {
			$.set(currentLang, $$value);
		}
	});

	var h3 = $.sibling(node, 2);
	var text = $.only_child(h3, true);

	$.reset(div);
	$.template_effect(($0) => $.set_text(text, $0), [() => m.example_message()]);
	$.append($$anchor, div);
	$.pop();
}