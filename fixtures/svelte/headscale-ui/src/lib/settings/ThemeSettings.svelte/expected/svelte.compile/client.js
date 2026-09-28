import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { themeStore } from '$lib/common/stores.js';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<h1 class="text-2xl bold text-primary mb-4">Theme Settings</h1> <select class="select select-bordered w-full select-sm max-w-xs"></select>`, 1);

export default function ThemeSettings($$anchor) {
	const $themeStore = () => $.store_get(themeStore, '$themeStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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

	var fragment = root_1();
	var select = $.sibling($.first_child(fragment), 2);

	$.each(select, 21, () => themes, $.index, ($$anchor, localTheme) => {
		var option = root();
		var text = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text, $.get(localTheme));

			if (option_value !== (option_value = $.get(localTheme))) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);
	$.bind_select_value(select, $themeStore, ($$value) => $.store_set(themeStore, $$value));
	$.append($$anchor, fragment);
	$$cleanup();
}