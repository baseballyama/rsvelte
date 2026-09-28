import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { derived } from 'svelte/store';
import { CIDR_CTX } from '$lib/contexts/cidr';
import { validateSubnetMask } from '$lib/utils/ip-validation.js';

var root = $.from_html(`<div class="converter-section fade-in svelte-9wj47d"><div class="form-group svelte-9wj47d"><label for="mask-input">Subnet Mask</label> <input id="mask-input" type="text" placeholder="255.255.255.0"/></div> <div class="result-display success svelte-9wj47d"><div class="result-content svelte-9wj47d"><span class="result-label svelte-9wj47d">CIDR Notation</span> <span class="result-value svelte-9wj47d"> </span></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $mask = () => $.store_get(mask, '$mask', $$stores);
	const $isValid = () => $.store_get(isValid, '$isValid', $$stores);
	const $cidr = () => $.store_get(cidr, '$cidr', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { cidr, mask, handleMaskChange } = getContext(CIDR_CTX);

	// Track validation state reactively
	const isValid = derived(mask, ($mask) => validateSubnetMask($mask).valid);

	var div = root();
	var div_1 = $.child(div);
	var input = $.sibling($.child(div_1), 2);

	$.remove_input_defaults(input);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.child(div_2);
	var span = $.sibling($.child(div_3), 2);
	var text = $.only_child(span);

	$.reset(div_3);
	$.reset(div_2);
	$.reset(div);

	$.template_effect(() => {
		$.set_value(input, $mask());
		$.set_class(input, 1, `mask-input ${$isValid() ? '' : 'invalid'}`, 'svelte-9wj47d');
		$.set_text(text, `/${$cidr() ?? ''}`);
	});

	$.event('input', input, (e) => handleMaskChange(e.target.value));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}