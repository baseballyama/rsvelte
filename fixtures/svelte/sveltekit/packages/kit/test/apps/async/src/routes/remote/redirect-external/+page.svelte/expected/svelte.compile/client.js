import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { redirectOutsideApp } from './redirect.remote.js';

var root = $.from_html(`<button id="trigger">trigger</button> <p id="status"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let status = $.state('idle');

	async function run() {
		$.set(status, 'pending');

		try {
			await redirectOutsideApp();
			$.set(status, 'resolved');
		} catch {
			$.set(status, 'rejected');
		}
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var p = $.sibling(button, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $.get(status)));
	$.delegated('click', button, run);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);