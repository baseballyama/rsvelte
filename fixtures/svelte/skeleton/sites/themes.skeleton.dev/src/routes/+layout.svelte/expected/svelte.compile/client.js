import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/stores';
import './layout.css';

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	$.user_effect(() => {
		// Sets <body data-theme> based on active route
		// Prevents generator CSS property precedence issues.
		if ($page().url.pathname === '/themes/create') {
			document.documentElement.setAttribute('data-theme', 'generated');
		} else {
			document.documentElement.setAttribute('data-theme', ''); // cerberus
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}