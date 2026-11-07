import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import store from './store.js';

var root = $.from_html(`<p></p> <p></p> <p> </p>`, 1);

export default function Runes_with_store01_input($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let count = 0;
	let doubled = $.derived(() => count * 2);
	var fragment = root();
	var p = $.first_child(fragment);

	p.textContent = 'Count: 0';

	var p_1 = $.sibling(p, 2);

	p_1.textContent = `Doubled: ${$.get(doubled) ?? ''}`;

	var p_2 = $.sibling(p_1, 2);
	var text = $.only_child(p_2);

	$.template_effect(() => $.set_text(text, `Store value: ${$store().foo ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}