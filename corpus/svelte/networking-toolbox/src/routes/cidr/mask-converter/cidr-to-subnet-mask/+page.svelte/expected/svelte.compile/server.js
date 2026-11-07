import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { CIDR_CTX } from '$lib/contexts/cidr';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { cidr, mask } = getContext(CIDR_CTX);

		$$renderer.push(`<div class="converter-section fade-in svelte-dvqsgr"><div class="form-group svelte-dvqsgr"><label for="cidr-slider" class="slider-label svelte-dvqsgr">CIDR Prefix Length: /${$.escape($.store_get($$store_subs ??= {}, '$cidr', cidr))}</label> <div class="slider-container svelte-dvqsgr"><input id="cidr-slider" type="range" min="0" max="32"${$.attr('value', $.store_get($$store_subs ??= {}, '$cidr', cidr))} class="cidr-slider svelte-dvqsgr"/> <div class="slider-markers svelte-dvqsgr"><span>0</span><span>8</span><span>16</span><span>24</span><span>32</span></div></div></div> <div class="result-display info svelte-dvqsgr"><div class="result-content svelte-dvqsgr"><span class="result-label svelte-dvqsgr">Subnet Mask</span> <span class="result-value svelte-dvqsgr">${$.escape($.store_get($$store_subs ??= {}, '$mask', mask))}</span></div></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}