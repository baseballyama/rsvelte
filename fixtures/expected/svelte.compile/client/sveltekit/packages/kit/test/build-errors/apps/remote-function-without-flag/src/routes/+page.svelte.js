import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { greet } from './data.remote.js';

var root = $.from_html(`<h1> </h1>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var h1 = root();
	var text = $.only_child(h1, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => greet()]);
	$.append($$anchor, h1);
	$.pop();
}