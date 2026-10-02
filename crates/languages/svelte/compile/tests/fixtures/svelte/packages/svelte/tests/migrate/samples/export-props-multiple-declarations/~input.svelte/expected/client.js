import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let a;
	let b;
	let c;
	let d;
	let e;
	let f;
	let g;
	let h;

	var $$exports = {
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

		get f() {
			return f;
		},

		set f($$value) {
			f = $$value;
		},

		get h() {
			return h;
		},

		set h($$value) {
			h = $$value;
		}
	};

	return $.pop($$exports);
}