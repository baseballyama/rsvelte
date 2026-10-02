import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '$lib/app.css';
import { browser } from '$app/environment';
import { compilers_registered } from '$lib/stores';
import { registerProcessors } from '$lib/builder/component';
import { Toaster } from '$lib/components/ui/sonner';

var root = $.from_html(`<link rel="preconnect" href="https://fonts.bunny.net"/> <link href="https://fonts.bunny.net/css2?family=Fira+Code:wght@300..700&amp;display=swap" rel="stylesheet"/>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $compilers_registered = () => $.store_get(compilers_registered, '$compilers_registered', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	if (browser) {
		const loader = document.getElementById('app-boot-loader');

		if (loader) {
			loader.classList.add('hidden');
			setTimeout(() => loader.remove(), 250);
		}

		import('$lib/compiler/processors').then(({ html, css }) => {
			registerProcessors({ html, css });
			$.store_set(compilers_registered, true);
		});
	}

	var fragment_1 = root_1();

	$.head('12qhfyh', ($$anchor) => {
		var fragment = root();

		$.next(2);
		$.append($$anchor, fragment);
	});

	var node = $.first_child(fragment_1);

	Toaster(node, {});

	var node_1 = $.sibling(node, 2);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment_1);
	$.pop();
	$$cleanup();
}