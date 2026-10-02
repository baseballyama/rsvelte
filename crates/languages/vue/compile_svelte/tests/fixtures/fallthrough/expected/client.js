import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

import { normalizeClass } from 'vue';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

var root = $.from_html(`<p>root</p>`);

export default function Fallthrough_vue($$anchor, $$props) {
	$.push($$props, true);
	let rest = $.rest_props($$props, rest_excludes);
	let attrs = $.derived(() => {
		const fallthrough = { ...rest };
		delete fallthrough[''];
		delete fallthrough['key'];
		delete fallthrough['ref'];
		delete fallthrough['ref_for'];
		delete fallthrough['ref_key'];
		delete fallthrough['onVnodeBeforeMount'];
		delete fallthrough['onVnodeMounted'];
		delete fallthrough['onVnodeBeforeUpdate'];
		delete fallthrough['onVnodeUpdated'];
		delete fallthrough['onVnodeBeforeUnmount'];
		delete fallthrough['onVnodeUnmounted'];
		return fallthrough;
	});
	var p = root();
	$.attribute_effect(p, ($0) => ({ ...$.get(attrs), class: $0 }), [() => 'class' in $.get(attrs) ? normalizeClass(['inner', $.get(attrs).class]) : 'inner']);
	$.append($$anchor, p);
	$.pop();
}
