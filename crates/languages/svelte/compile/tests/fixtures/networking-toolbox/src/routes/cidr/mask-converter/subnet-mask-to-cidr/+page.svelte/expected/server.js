import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { derived } from 'svelte/store';
import { CIDR_CTX } from '$lib/contexts/cidr';
import { validateSubnetMask } from '$lib/utils/ip-validation.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { cidr, mask, handleMaskChange } = getContext(CIDR_CTX);

		// Track validation state reactively
		const isValid = derived(mask, ($mask) => validateSubnetMask($mask).valid);

		$$renderer.push(`<div class="converter-section fade-in svelte-9wj47d"><div class="form-group svelte-9wj47d"><label for="mask-input">Subnet Mask</label> <input id="mask-input" type="text"${$.attr('value', $.store_get($$store_subs ??= {}, '$mask', mask))} placeholder="255.255.255.0"${$.attr_class(`mask-input ${$.store_get($$store_subs ??= {}, '$isValid', isValid) ? '' : 'invalid'}`, 'svelte-9wj47d')}/></div> <div class="result-display success svelte-9wj47d"><div class="result-content svelte-9wj47d"><span class="result-label svelte-9wj47d">CIDR Notation</span> <span class="result-value svelte-9wj47d">/${$.escape($.store_get($$store_subs ??= {}, '$cidr', cidr))}</span></div></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}