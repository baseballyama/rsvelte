import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NavItem } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';
import { page } from '$app/stores';

var root = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>Active path</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			NavItem($$anchor, {
				text: 'Home',
				get currentUrl() {
					return $page().url;
				},
				path: '/'
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			NavItem($$anchor, {
				text: 'NavItem',
				get currentUrl() {
					return $page().url;
				},
				path: '/docs/components/NavItem',
				classes: { root: 'pl-3', active: 'bg-primary/10 text-primary' }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}