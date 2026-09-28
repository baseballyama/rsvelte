import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Caret from '$lib/components/icons/Caret.svelte';

var root = $.from_html(`<button class="svelte-14kx1bs"><!> <!></button> <!>`, 1);

export default function Expandroute($$anchor, $$props) {
	let expanded = $.state(false);
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.child(button);

	{
		let $0 = $.derived(() => $.get(expanded) ? 90 : 0);

		Caret(node, {
			get style() {
				return `height: 1em; width: 1em; rotate: ${$.get($0) ?? ''}deg; transition: all 200ms ease-in-out;`;
			}
		});
	}

	var node_1 = $.sibling(node, 2);

	$.snippet(node_1, () => $$props.title);
	$.reset(button);

	var node_2 = $.sibling(button, 2);

	$.snippet(node_2, () => $$props.subRoutes, () => $.get(expanded));
	$.delegated('click', button, () => $.set(expanded, !$.get(expanded)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);