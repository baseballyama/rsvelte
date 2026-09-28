import * as $ from 'svelte/internal/server';
import { showACLPagesStore } from '$lib/common/stores';
import { fade } from 'svelte/transition';

export default function DevSettings($$renderer) {
	var $$store_subs;
	let showDevSettings = false;

	$$renderer.push(`<div class="inline-block"><h1 class="text-2xl bold text-primary mb-4">Developer Flags<input type="checkbox" class="toggle toggle-sm tooltip ml-2 align-middle" data-tip="To enable development features. Only check this if you're a developer or like being confused"${$.attr('checked', showDevSettings, true)}/></h1></div> `);

	if (showDevSettings) {
		$$renderer.push(`<!--[0--><div><h2 class="text-xl bold text-secondary mb-2 ml-2">ACL Pages <input${$.attr('checked', $.store_get($$store_subs ??= {}, '$showACLPagesStore', showACLPagesStore), true)} type="checkbox" class="toggle toggle-sm ml-2 align-middle"/></h2></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}