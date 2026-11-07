import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function A($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { i, j, k } = { i: 9, j: 10, k: writable(11) };
		const l = 12;
		const m = 13;
		const n = writable(14);
		let { a, b, c } = { a: 9, b: 10, c: writable(11) };
		let d = 12;
		let e = 13;
		let f = writable(14);

		$$renderer.push(`<div>i: ${$.escape(i)}, j: ${$.escape(j)}, k: ${$.escape($.store_get($$store_subs ??= {}, '$k', k))}, l: ${$.escape(l)}, m: 13, n: ${$.escape($.store_get($$store_subs ??= {}, '$n', n))}, a: ${$.escape(a)}, b: ${$.escape(b)}, c: ${$.escape($.store_get($$store_subs ??= {}, '$c', c))}, d: ${$.escape(d)}, e: 13, f: ${$.escape($.store_get($$store_subs ??= {}, '$f', f))}</div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { i, k, l, n, a, c, d, f });
	});
}