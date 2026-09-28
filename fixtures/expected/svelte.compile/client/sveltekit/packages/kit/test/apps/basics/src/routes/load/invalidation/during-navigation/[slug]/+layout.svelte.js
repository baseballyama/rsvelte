import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { refreshAll } from '$app/navigation';

var root = $.from_html(`<nav><a href="/load/invalidation/during-navigation/a" data-testid="nav-a">a</a> <a href="/load/invalidation/during-navigation/b" data-testid="nav-b">b</a> <a href="/load/invalidation/during-navigation/b" data-testid="nav-b-refresh">b+refresh</a> <a href="/load/invalidation/during-navigation/a" data-testid="nav-a-refresh">a+refresh</a></nav> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var nav = $.first_child(fragment);
	var a = $.sibling($.child(nav), 4);
	var a_1 = $.sibling(a, 2);

	$.reset(nav);

	var node = $.sibling(nav, 2);

	$.snippet(node, () => $$props.children);
	$.delegated('click', a, () => setTimeout(() => refreshAll(), 50));
	$.delegated('click', a_1, () => setTimeout(() => refreshAll(), 50));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);