import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a data-sveltekit-keepfocus=""></a> <a data-sveltekit-noscroll=""></a> <a data-sveltekit-preload-code=""></a> <a data-sveltekit-preload-data=""></a> <a data-sveltekit-reload=""></a> <a data-sveltekit-replacestate=""></a> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 12);

	$.element(node, () => 'a', false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ 'data-sveltekit-preload-data': true }));
	});

	$.append($$anchor, fragment);
}