import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { spring } from 'svelte/motion';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $x = () => $.store_get(x, '$x', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const x = spring(0);

	x.set(1);

	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $x()));
	$.append($$anchor, p);
	$.pop();
	$$cleanup();
}