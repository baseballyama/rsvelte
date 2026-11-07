import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { store, themeState } from './theme.svelte.js';

var root = $.from_html(`<button>+</button> `, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let i = 0;

	const increment = () => {
		store.update(() => ({ theme: ++i % 2 == 0 ? 'dark' : 'light' }));
	};

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.sibling(button);

	$.template_effect(() => $.set_text(text, ` ${themeState.value.theme ?? ''}`));
	$.delegated('click', button, increment);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);