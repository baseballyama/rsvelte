import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { beforeNavigate } from '$app/navigation';

var root = $.from_html(`<a href="/navigation-lifecycle/before-navigate/redirect">redirect</a>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	beforeNavigate(({ complete }) => {
		complete.then(() => {
			console.log('complete');
		});
	});

	var a = root();

	$.append($$anchor, a);
	$.pop();
}