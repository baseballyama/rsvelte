import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { time } from './stores.js';

var root = $.from_html(`<h1> </h1>`);

export default function Readable_stores_input($$anchor, $$props) {
	$.push($$props, true);

	const $time = () => $.store_get(time, '$time', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const formatter = new Intl.DateTimeFormat('en', {
		hour12: true,
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit'
	});

	var h1 = root();
	var text = $.only_child(h1);

	$.template_effect(($0) => $.set_text(text, `The time is ${$0 ?? ''}`), [() => formatter.format($time())]);
	$.append($$anchor, h1);
	$.pop();
	$$cleanup();
}