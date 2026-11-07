import * as $ from 'svelte/internal/server';
import '../app.css';
import Nav from '$lib/common/nav.svelte';
import Alert from '$lib/common/Alert.svelte';
import Stores from '$lib/common/Stores.svelte';
import { themeStore } from '$lib/common/stores.js';

export default function _layout($$renderer, $$props) {
	var $$store_subs;

	$$renderer.push(`<main${$.attr('data-theme', $.store_get($$store_subs ??= {}, '$themeStore', themeStore))} class="flex flex-col">`);
	Stores($$renderer, {});
	$$renderer.push(`<!----> <div class="flex">`);
	Nav($$renderer, {});
	$$renderer.push(`<!----> <div class="flex flex-1 min-w-0 flex-col bg-base-100">`);
	Alert($$renderer, {});
	$$renderer.push(`<!---->  <div><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></div></div></div></main>`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
	// NOTE: the element that is using one of the theme attributes must be in the DOM on mount
}