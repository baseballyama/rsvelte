import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComponentHead from '$lib/demo/component-head.svelte';
import Content from '$lib/demo/component-preview/content.svelte';
import { onNavigate } from '$app/navigation';

var root = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	var fragment = root();
	var node = $.first_child(fragment);

	ComponentHead(node, {
		get component() {
			return $$props.data.component;
		}
	});

	var node_1 = $.sibling(node, 2);

	Content(node_1, {
		isSinglePage: true,
		get component() {
			return $$props.data.component;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}