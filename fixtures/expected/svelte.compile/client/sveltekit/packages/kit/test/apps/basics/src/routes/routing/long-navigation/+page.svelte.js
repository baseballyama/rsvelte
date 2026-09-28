import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onNavigate } from '$app/navigation';

var root = $.from_html(`<a href="/routing">Go to routing</a>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	onNavigate(() => new Promise((resolve) => setTimeout(resolve, 3000)));

	var a = root();

	$.append($$anchor, a);
	$.pop();
}