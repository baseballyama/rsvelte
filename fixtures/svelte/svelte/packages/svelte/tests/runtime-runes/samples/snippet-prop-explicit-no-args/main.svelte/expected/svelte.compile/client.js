import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Counter from './Counter.svelte';

const foo = ($$anchor) => {
	var p = root();

	$.append($$anchor, p);
};

var root = $.from_html(`<p>foo</p>`);

export default function Main($$anchor) {
	Counter($$anchor, {
		get foo() {
			return foo;
		}
	});
}