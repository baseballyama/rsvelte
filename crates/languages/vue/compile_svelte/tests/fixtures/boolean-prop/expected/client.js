import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

import { normalizeClass, toDisplayString } from 'vue';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

var root = $.from_html(`<p> </p>`);

export default function Boolean_prop_vue($$anchor, $$props) {
	$.push($$props, true);
	let rest = $.rest_props($$props, rest_excludes);
	let flag = $.derived(() => {
		let value = rest.flag;
		if (!('flag' in rest)) return false;
		if (value === '' || value === 'flag') return true;
		return value;
	});
	let shown = $.derived(() => {
		let value_1 = rest.shown;
		if (!('shown' in rest)) return false;
		if (value_1 === '' || value_1 === 'shown') return true;
		return value_1;
	});
	let attrs = $.derived(() => {
		const fallthrough = { ...rest };
		delete fallthrough['flag'];
		delete fallthrough['shown'];
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
	$.attribute_effect(p, ($0) => ({ ...$0 }), [() => 'class' in $.get(attrs) ? { ...$.get(attrs), class: normalizeClass([$.get(attrs).class]) } : $.get(attrs)]);
	var text = $.only_child(p);
	$.template_effect(($0, $1) => $.set_text(text, `flag ${$0 ?? ''}, shown ${$1 ?? ''}`), [() => toDisplayString(String($.get(flag))), () => toDisplayString(String($.get(shown)))]);
	$.append($$anchor, p);
	$.pop();
}
