import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { live_value, notify } from './data.remote.js';

var root = $.from_html(`<p id="live-state"> </p> <button id="notify">notify</button>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const key = page.url.searchParams.get('key') ?? 'default';
	const live = live_value(key);
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var button = $.sibling(p, 2);

	$.template_effect(() => $.set_text(text, live.ready ? live.current : 'loading'));
	$.delegated('click', button, () => notify(key));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);