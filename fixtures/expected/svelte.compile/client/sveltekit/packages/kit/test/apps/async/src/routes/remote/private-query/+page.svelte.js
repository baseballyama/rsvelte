import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { reveal } from './data.remote.js';

var root = $.from_html(`<button id="reveal">reveal</button> <p id="result"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let result = $.state('none');
	var fragment = root();
	var button = $.first_child(fragment);
	var p = $.sibling(button, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $.get(result)));
	$.delegated('click', button, async () => $.set(result, await reveal(), true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);