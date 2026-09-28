import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<div> </div>`);

export default function A($$anchor, $$props) {
	$.push($$props, true);

	const $k = () => $.store_get(k, '$k', $$stores);
	const $n = () => $.store_get(n, '$n', $$stores);
	const $c = () => $.store_get(c, '$c', $$stores);
	const $f = () => $.store_get(f, '$f', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { i, j, k } = { i: 9, j: 10, k: writable(11) };
	const l = 12;
	const m = 13;
	const n = writable(14);
	let { a, b, c } = { a: 9, b: 10, c: writable(11) };
	let d = 12;
	let e = 13;
	let f = writable(14);

	var $$exports = {
		i,
		k,
		l,
		n,
		get a() {
			return a;
		},

		set a($$value) {
			a = $$value;
		},

		get c() {
			return c;
		},

		set c($$value) {
			c = $$value;
		},

		get d() {
			return d;
		},

		set d($$value) {
			d = $$value;
		},

		get f() {
			return f;
		},

		set f($$value) {
			f = $$value;
		}
	};

	var div = root();
	var text = $.only_child(div);

	$.template_effect(() => $.set_text(text, `i: ${i ?? ''}, j: ${j ?? ''}, k: ${$k() ?? ''}, l: ${l ?? ''}, m: 13, n: ${$n() ?? ''}, a: ${a ?? ''}, b: ${b ?? ''}, c: ${$c() ?? ''}, d: ${d ?? ''}, e: 13, f: ${$f() ?? ''}`));
	$.append($$anchor, div);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}