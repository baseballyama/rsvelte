import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		function action(node, binding) {
			return { update: (value) => s.set(value) };
		}

		let s = writable("simple");
		let v = "";

		function click() {
			s.set('clicked');
		}

		$$renderer.push(`<input${$.attr('value', v)}/> <div>${$.escape(v)}</div> <div>${$.escape($.store_get($$store_subs ??= {}, '$s', s))}</div> <button>click me</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}