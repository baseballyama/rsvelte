import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Counter from './Counter.svelte';

const foo = ($$anchor, n = $.noop) => {
	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `clicks: ${n() ?? ''}`));
	$.append($$anchor, p);
};

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor) {
	Counter($$anchor, {
		get foo() {
			return foo;
		}
	});
}