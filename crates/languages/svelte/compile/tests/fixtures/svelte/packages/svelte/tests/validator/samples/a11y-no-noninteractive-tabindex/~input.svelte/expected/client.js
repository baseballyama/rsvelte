import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>click me</button> <button tabindex="0">click me</button> <button>click me</button> <div></div> <div tabindex="-1"></div> <div role="button" tabindex="0"></div> <div role="article" tabindex="-1"></div> <article tabindex="-1"></article> <div role="tabpanel" tabindex="0"></div> <!> <div tabindex="0"></div> <div role="article" tabindex="0"></div> <article tabindex="0"></article> <article></article>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var button = $.sibling($.first_child(fragment), 4);

	$.set_attribute(button, 'tabindex', 0);

	var node = $.sibling(button, 14);

	$.element(node, () => Math.random() ? 'button' : 'div', false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ tabindex: '0' }));
	});

	var article = $.sibling(node, 8);

	$.set_attribute(article, 'tabindex', 0);
	$.append($$anchor, fragment);
}