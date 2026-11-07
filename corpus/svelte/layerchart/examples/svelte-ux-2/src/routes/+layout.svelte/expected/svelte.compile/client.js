import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { settings, ThemeInit, ThemeSwitch } from 'svelte-ux';
import favicon from '$lib/assets/favicon.svg';
import '../app.css';

var root = $.from_html(`<link rel="icon"/>`);
var root_1 = $.from_html(`<!> <main class="p-4"><div class="pb-4 text-right"><!></div> <!></main>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);
	settings();

	var fragment = root_1();

	$.head('1smimic', ($$anchor) => {
		var link = root();

		$.template_effect(() => $.set_attribute(link, 'href', favicon));
		$.append($$anchor, link);
	});

	var node = $.first_child(fragment);

	ThemeInit(node, {});

	var main = $.sibling(node, 2);
	var div = $.child(main);
	var node_1 = $.child(div);

	ThemeSwitch(node_1, {});
	$.reset(div);

	var node_2 = $.sibling(div, 2);

	$.snippet(node_2, () => $$props.children ?? $.noop);
	$.reset(main);
	$.append($$anchor, fragment);
	$.pop();
}