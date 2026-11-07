import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { goto } from '$app/navigation';

var root = $.from_html(`<button id="reload-button">Reload</button>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	var button = root();

	$.delegated('click', button, () => goto(page.url.toString()));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);