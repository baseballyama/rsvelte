import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { CIDR_CTX } from '$lib/contexts/cidr';

var root = $.from_html(`<div class="converter-section fade-in svelte-dvqsgr"><div class="form-group svelte-dvqsgr"><label for="cidr-slider" class="slider-label svelte-dvqsgr"> </label> <div class="slider-container svelte-dvqsgr"><input id="cidr-slider" type="range" min="0" max="32" class="cidr-slider svelte-dvqsgr"/> <div class="slider-markers svelte-dvqsgr"><span>0</span><span>8</span><span>16</span><span>24</span><span>32</span></div></div></div> <div class="result-display info svelte-dvqsgr"><div class="result-content svelte-dvqsgr"><span class="result-label svelte-dvqsgr">Subnet Mask</span> <span class="result-value svelte-dvqsgr"> </span></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $cidr = () => $.store_get(cidr, '$cidr', $$stores);
	const $mask = () => $.store_get(mask, '$mask', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { cidr, mask } = getContext(CIDR_CTX);
	var div = root();
	var div_1 = $.child(div);
	var label = $.child(div_1);
	var text = $.only_child(label);
	var div_2 = $.sibling(label, 2);
	var input = $.child(div_2);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.child(div_3);
	var span = $.sibling($.child(div_4), 2);
	var text_1 = $.only_child(span, true);

	$.reset(div_4);
	$.reset(div_3);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, `CIDR Prefix Length: /${$cidr() ?? ''}`);
		$.set_value(input, $cidr());
		$.set_text(text_1, $mask());
	});

	$.event('input', input, (e) => cidr.set(Number(e.target.value)));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}