import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';
import { createSwitch, melt } from '@melt-ui/svelte';
import { preferences } from './preferences.svelte';

var root_1 = $.from_html(`<form><div class="container svelte-1whwdji"><label for="dyslexic-font">Use font for dyslexia</label> <button class="toggle svelte-1whwdji" aria-labelledby="dyslexic-font"><span class="thumb svelte-1whwdji"></span></button> <input id="dyslexic-font"/></div></form>`);

export default function Dyslexic($$anchor, $$props) {
	$.push($$props, true);

	const $root = () => $.store_get(root, '$root', $$stores);
	const $input = () => $.store_get(input, '$input', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let enabled = false;

	if (browser) {
		localStorage.font ? enabled = true : enabled = false;
	}

	function handleChange() {
		const html = document.documentElement;

		enabled = !enabled;

		if (enabled) {
			localStorage.font = 'dyslexic';
			html.dataset.font = 'dyslexic';
		}

		if (!enabled) {
			localStorage.removeItem('font');
			delete html.dataset.font;
		}
	}

	const { elements: { root, input }, states: { checked } } = createSwitch();

	$.user_effect(() => {
		preferences.resetTheme;
		checked.set(false);
		enabled = false;
	});

	var form = root_1();
	var div = $.child(form);
	var button = $.sibling($.child(div), 2);

	$.action(button, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $root);

	var input_1 = $.sibling(button, 2);

	$.action(input_1, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $input);
	$.action(input_1, ($$node) => input?.($$node));
	$.reset(div);
	$.reset(form);
	$.delegated('click', button, handleChange);
	$.append($$anchor, form);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);