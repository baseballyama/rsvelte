import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';

var root = $.from_html(`<ul><li><a id="home">home</a></li> <li><a id="target" data-sveltekit-preload-data="hover">target</a></li></ul> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var ul = $.first_child(fragment);
	var li = $.child(ul);
	var a = $.only_child(li);
	var li_1 = $.sibling(li, 2);
	var a_1 = $.only_child(li_1);

	$.reset(ul);

	var node = $.sibling(ul, 2);

	$.snippet(node, () => $$props.children);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(a, 'href', $0);
			$.set_attribute(a_1, 'href', $1);
		},
		[
			() => resolve('/data-sveltekit/preload-data/repeat'),
			() => resolve('/data-sveltekit/preload-data/repeat/target')
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}