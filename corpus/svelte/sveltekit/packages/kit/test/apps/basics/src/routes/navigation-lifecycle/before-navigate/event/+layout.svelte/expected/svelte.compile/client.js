import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { beforeNavigate } from '$app/navigation';

var root = $.from_html(`<a href="/navigation-lifecycle/before-navigate/event/a">a</a> <a href="/navigation-lifecycle/before-navigate/event/b">b</a> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	beforeNavigate((navigation) => {
		if (navigation.type === 'link' || navigation.type === 'popstate') {
			console.log(`${navigation.event.type} ${navigation.from?.url.pathname} -> ${navigation.to?.url.pathname}`);
		}
	});

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

	$.snippet(node, () => $$props.children);
	$.append($$anchor, fragment);
	$.pop();
}