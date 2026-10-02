import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { time, elapsed } from './stores.js';

var root = $.from_html(`<h1> </h1> <p> </p>`, 1);

export default function Derived_stores_input($$anchor, $$props) {
	$.push($$props, true);

	const $time = () => $.store_get(time, '$time', $$stores);
	const $elapsed = () => $.store_get(elapsed, '$elapsed', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const formatter = new Intl.DateTimeFormat('en', {
		hour12: true,
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit'
	});

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p);

	$.template_effect(
		($0) => {
			$.set_text(text, `The time is ${$0 ?? ''}`);

			$.set_text(text_1, `This page has been open for
	${$elapsed() ?? ''} ${$elapsed() === 1 ? 'second' : 'seconds'}`);
		},
		[() => formatter.format($time())]
	);

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}