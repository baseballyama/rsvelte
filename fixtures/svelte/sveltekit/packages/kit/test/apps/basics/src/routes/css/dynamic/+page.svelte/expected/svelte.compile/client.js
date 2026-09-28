import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>load component</button> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/** @type {typeof import('./Dynamic.svelte').default}*/
	let Dynamic;

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.component(node, () => Dynamic, ($$anchor, $$component) => {
		$$component($$anchor, {});
	});

	$.delegated('click', button, async () => {
		Dynamic = (await import('./Dynamic.svelte')).default;
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);