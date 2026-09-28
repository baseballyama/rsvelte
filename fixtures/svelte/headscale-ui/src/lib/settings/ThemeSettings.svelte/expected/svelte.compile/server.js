import * as $ from 'svelte/internal/server';
import { themeStore } from '$lib/common/stores.js';

export default function ThemeSettings($$renderer) {
	var $$store_subs;

	let themes = [
		'hsui',
		'light',
		'dark',
		'cupcake',
		'bumblebee',
		'emerald',
		'corporate',
		'synthwave',
		'retro',
		'cyberpunk',
		'valentine',
		'halloween',
		'garden',
		'forest',
		'aqua',
		'lofi',
		'pastel',
		'fantasy',
		'wireframe',
		'black',
		'luxury',
		'dracula',
		'cmyk',
		'autumn',
		'business',
		'acid',
		'lemonade',
		'night',
		'coffee',
		'winter'
	];

	$$renderer.push(`<h1 class="text-2xl bold text-primary mb-4">Theme Settings</h1> `);

	$$renderer.select(
		{
			value: $.store_get($$store_subs ??= {}, '$themeStore', themeStore),
			class: 'select select-bordered w-full select-sm max-w-xs'
		},
		($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(themes);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let localTheme = each_array[$$index];

				$$renderer.option({ value: localTheme }, ($$renderer) => {
					$$renderer.push(`${$.escape(localTheme)}`);
				});
			}

			$$renderer.push(`<!--]-->`);
		}
	);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}