import * as $ from 'svelte/internal/server';
import { IconMoon, IconSun } from '@tabler/icons-svelte';
import { s } from '$lib/client/localization.svelte';
import { settings, themeSettings } from '$lib/data/settings.svelte.js';

export default function ThemeSelector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function handleChange(value) {
			themeSettings.theme = value;
			settings.theme.save();
		}

		$$renderer.push(`<div class="flex flex-col space-y-2"><span class="text-sm font-medium text-gray-700 dark:text-gray-300" id="theme-label">${$.escape(s("settings.theme.label") || "Theme")}</span> <div class="inline-flex h-10 w-full rounded-full border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800 overflow-hidden" role="radiogroup" aria-labelledby="theme-label"><button type="button" role="radio"${$.attr('aria-checked', themeSettings.theme === 'system')}${$.attr_class(`flex h-full flex-1 items-center justify-center gap-1.5 border-e border-gray-200 px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-600 ${themeSettings.theme === 'system'
			? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
			: 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`)}>${$.escape(s("settings.theme.system") || "System Default")}</button> <button type="button" role="radio"${$.attr('aria-checked', themeSettings.theme === 'light')}${$.attr_class(`flex h-full flex-1 items-center justify-center gap-1.5 border-e border-gray-200 px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-600 ${themeSettings.theme === 'light'
			? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
			: 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`)}>`);

		IconSun($$renderer, { size: 16 });

		$$renderer.push(`<!----> ${$.escape(s("settings.theme.light") || "Light")}</button> <button type="button" role="radio"${$.attr('aria-checked', themeSettings.theme === 'dark')}${$.attr_class(`flex h-full flex-1 items-center justify-center gap-1.5 px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-blue-500 ${themeSettings.theme === 'dark'
			? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
			: 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`)}>`);

		IconMoon($$renderer, { size: 16 });
		$$renderer.push(`<!----> ${$.escape(s("settings.theme.dark") || "Dark")}</button></div></div>`);
	});
}