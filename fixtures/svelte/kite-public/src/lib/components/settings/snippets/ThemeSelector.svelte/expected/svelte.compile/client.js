import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconMoon, IconSun } from '@tabler/icons-svelte';
import { s } from '$lib/client/localization.svelte';
import { settings, themeSettings } from '$lib/data/settings.svelte.js';

var root = $.from_html(`<div class="flex flex-col space-y-2"><span class="text-sm font-medium text-gray-700 dark:text-gray-300" id="theme-label"> </span> <div class="inline-flex h-10 w-full rounded-full border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800 overflow-hidden" role="radiogroup" aria-labelledby="theme-label"><button type="button" role="radio"> </button> <button type="button" role="radio"><!> </button> <button type="button" role="radio"><!> </button></div></div>`);

export default function ThemeSelector($$anchor, $$props) {
	$.push($$props, true);

	function handleChange(value) {
		themeSettings.theme = value;
		settings.theme.save();
	}

	var div = root();
	var span = $.child(div);
	var text = $.only_child(span, true);
	var div_1 = $.sibling(span, 2);
	var button = $.child(div_1);
	var text_1 = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);
	var node = $.child(button_1);

	IconSun(node, { size: 16 });

	var text_2 = $.sibling(node);

	$.reset(button_1);

	var button_2 = $.sibling(button_1, 2);
	var node_1 = $.child(button_2);

	IconMoon(node_1, { size: 16 });

	var text_3 = $.sibling(node_1);

	$.reset(button_2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3) => {
			$.set_text(text, $0);
			$.set_attribute(button, 'aria-checked', themeSettings.theme === 'system');

			$.set_class(button, 1, `flex h-full flex-1 items-center justify-center gap-1.5 border-e border-gray-200 px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-600
        ${themeSettings.theme === 'system'
				? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
				: 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`);

			$.set_text(text_1, $1);
			$.set_attribute(button_1, 'aria-checked', themeSettings.theme === 'light');

			$.set_class(button_1, 1, `flex h-full flex-1 items-center justify-center gap-1.5 border-e border-gray-200 px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-600
        ${themeSettings.theme === 'light'
				? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
				: 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`);

			$.set_text(text_2, ` ${$2 ?? ''}`);
			$.set_attribute(button_2, 'aria-checked', themeSettings.theme === 'dark');

			$.set_class(button_2, 1, `flex h-full flex-1 items-center justify-center gap-1.5 px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-blue-500
        ${themeSettings.theme === 'dark'
				? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
				: 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`);

			$.set_text(text_3, ` ${$3 ?? ''}`);
		},
		[
			() => s("settings.theme.label") || "Theme",
			() => s("settings.theme.system") || "System Default",
			() => s("settings.theme.light") || "Light",
			() => s("settings.theme.dark") || "Dark"
		]
	);

	$.delegated('click', button, () => handleChange('system'));
	$.delegated('click', button_1, () => handleChange('light'));
	$.delegated('click', button_2, () => handleChange('dark'));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);