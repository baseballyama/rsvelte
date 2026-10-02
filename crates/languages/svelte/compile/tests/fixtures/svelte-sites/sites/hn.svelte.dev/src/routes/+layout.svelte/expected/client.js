import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page, navigating } from '$app/state';
import Nav from '$lib/Nav.svelte';
import PreloadingIndicator from '$lib/PreloadingIndicator.svelte';
import ThemeToggler from '$lib/ThemeToggler.svelte';
import '../app.css';

var root = $.from_html(`<!> <!> <main class="svelte-ugx4i7"><!></main> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const section = $.derived(() => page.url.pathname.split('/')[1]);
	var fragment = root();
	var node = $.first_child(fragment);

	Nav(node, {
		get section() {
			return $.get(section);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			PreloadingIndicator($$anchor, {});
		};

		$.if(node_1, ($$render) => {
			if (navigating.from) $$render(consequent);
		});
	}

	var main = $.sibling(node_1, 2);
	var node_2 = $.child(main);

	$.snippet(node_2, () => $$props.children);
	$.reset(main);

	var node_3 = $.sibling(main, 2);

	ThemeToggler(node_3, {});
	$.append($$anchor, fragment);
	$.pop();
}