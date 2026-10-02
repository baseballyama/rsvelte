import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<div>hello</div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const $text = () => $.store_get(text, '$text', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let store = writable({
		action: (node, text) => {
			node.textContent = text;

			return { destroy() {} };
		}
	});

	let text = writable('mounted');
	var div = root();

	$.action(div, ($$node, $$action_arg) => $store().action?.($$node, $$action_arg), $text);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}