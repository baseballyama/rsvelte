import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Foo from './Foo.svelte';

var root = $.from_html(`<link rel="canonical" href="/test"/> <meta name="description" content="test"/>`, 1);

export default function Main($$anchor) {
	let bar;

	$.head('1h99yi7', ($$anchor) => {
		var fragment = root();

		$.next(2);
		$.append($$anchor, fragment);
	});

	Foo($$anchor, {
		get bar() {
			return bar;
		},

		set bar($$value) {
			bar = $$value;
		}
	});
}