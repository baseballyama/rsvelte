import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/stores';

var root = $.from_html(`<div class="error svelte-1j96wlh"><h1 class="svelte-1j96wlh"> </h1></div>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var div = root();
	var h1 = $.child(div);
	var text = $.only_child(h1);

	$.reset(div);
	$.template_effect(() => $.set_text(text, `${$page().status ?? ''}: ${$page()?.error?.message ?? ''}`));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}