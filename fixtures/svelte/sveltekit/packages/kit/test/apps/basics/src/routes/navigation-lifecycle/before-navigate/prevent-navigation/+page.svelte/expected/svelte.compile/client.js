import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { beforeNavigate } from '$app/navigation';

var root = $.from_html(`<h1>prevent navigation</h1> <a href="/navigation-lifecycle/before-navigate/a">a</a> <a href="/navigation-lifecycle/before-navigate/redirect">redirect</a> <a href="/navigation-lifecycle/before-navigate/prevent-navigation?x=1">self</a> <a href="https://google.com" target="_blank" rel="noreferrer">_blank</a> <a href="https://google.de">external</a> <a download="" href="">external</a> <pre> </pre>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let times_triggered = 0;
	let unload = false;

	/** @type {import("$app/navigation").BeforeNavigate['type']} */
	let navigation_type;

	beforeNavigate(({ cancel, type, willUnload, to }) => {
		times_triggered++;
		unload = willUnload;
		navigation_type = type;

		if (!to?.route.id?.includes('redirect')) {
			cancel();
		}
	});

	var fragment = root();
	var pre = $.sibling($.first_child(fragment), 14);
	var text = $.only_child(pre);

	$.template_effect(() => $.set_text(text, `${times_triggered ?? ''} ${unload ?? ''} ${`${navigation_type}`}`));
	$.append($$anchor, fragment);
	$.pop();
}