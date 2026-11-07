import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteSet } from 'svelte/reactivity';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function* generator() {
		yield 1;
	}

	let gen = new SvelteSet(generator());
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => gen, $.index, ($$anchor, item) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, $.get(item)));
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
	$.pop();
}