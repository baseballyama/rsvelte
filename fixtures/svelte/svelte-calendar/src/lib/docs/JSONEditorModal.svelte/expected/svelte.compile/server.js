import * as $ from 'svelte/internal/server';
import CrossfadeProvider from '$lib/components/generic/crossfade/CrossfadeProvider.svelte';
import { storeContextKey } from '$lib/context';
import autofocus from '$lib/directives/autofocus';
import blurr from '$lib/directives/blurr';
import { getContext } from 'svelte';

export default function JSONEditorModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const store = getContext(storeContextKey);
		const originalValue = $.store_get($$store_subs ??= {}, '$store', store).editing.value;
		const path = $.store_get($$store_subs ??= {}, '$store', store).editing.mapping.path;
		let newValue = $.store_get($$store_subs ??= {}, '$store', store).editing.newValue;

		CrossfadeProvider($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { key, send, receive }) => {
					$$renderer.push(`<form><div class="default-editor svelte-xa8skv"><div class="heading svelte-xa8skv"><span class="label">${$.escape(path)}</span> <span class="value svelte-xa8skv">${$.escape(originalValue)}</span></div> <div class="form svelte-xa8skv"><input type="text"${$.attr('value', newValue)} class="svelte-xa8skv"/> <button type="submit" class="svelte-xa8skv">save</button> <button class="secondary svelte-xa8skv">revert</button></div></div></form>`);
				}
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}