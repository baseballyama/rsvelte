import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { setup } from '../../../../setup.js';

var root = $.from_html(`<a href="/">/</a> <a href="/#/a">/#/a</a> <a href="/#/b">/#/b</a> <a href="/#/a#b">/#/a#b</a> <a href="/#/b/123">/#/b/123</a> <a href="/#/b/456">/#/b/456</a> <a href="/#/reroute-a">/#/reroute-a</a> <a href="/#/reroute-b">/#/reroute-b</a> <button data-goto="">goto /#/b</button> <button data-shallow="">shallow /#/b</button> <button data-shallow-replace="">shallow replace /#/a#b</button> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);
	setup();

	var fragment = root();
	var button = $.sibling($.first_child(fragment), 16);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var node = $.sibling(button_2, 2);

	$.snippet(node, () => $$props.children);
	$.delegated('click', button, () => goto('/#/b'));
	$.delegated('click', button_1, () => goto('/#/b', { shallow: true }));
	$.delegated('click', button_2, () => goto('/#/a#b', { shallow: true, replace: true }));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);