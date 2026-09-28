import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let a;
	let b;
	let c;
	let d;

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
		}
	};

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, a));
	$.append($$anchor, text);

	return $.pop($$exports);
}