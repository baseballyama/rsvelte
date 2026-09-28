import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';
import Widget from './Widget.svelte';

var root = $.from_html(`<pre>fail</pre>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $a = () => $.store_get(a, '$a', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let a = writable({});
	let b = () => true;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Widget($$anchor, {});
		};

		var d = $.derived(() => $a() || b());

		var alternate = ($$anchor) => {
			var pre = root();

			$.append($$anchor, pre);
		};

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}