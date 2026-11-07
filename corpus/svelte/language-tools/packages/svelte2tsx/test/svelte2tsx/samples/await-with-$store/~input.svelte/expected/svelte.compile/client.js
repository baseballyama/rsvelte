import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { readable } from 'svelte/store';

var root = $.from_html(`<p>loading</p>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const store = readable(Promise.resolve('test'), () => {});
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		$store,
		($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		},
		($$anchor, data) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, $.get(data)));
			$.append($$anchor, text);
		}
	);

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}