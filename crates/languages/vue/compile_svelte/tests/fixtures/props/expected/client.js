import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

import { normalizeClass, toDisplayString } from 'vue';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'label', 'start', 'step']);

var root = $.from_html(`<button> </button>`);

export default function Props_vue($$anchor, $$props) {
	$.push($$props, true);
	let label = $.prop($$props, 'label', 3, 'Count'), start = $.prop($$props, 'start', 3, 0), step = $.prop($$props, 'step', 3, 1), rest = $.rest_props($$props, rest_excludes);
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
	let count = $.state(start());
	var button = root();
	var event_handler = (event) => $.set(count, $.get(count) + step());
	$.attribute_effect(button, ($0) => ({ onclick: event_handler, ...$.get(attrs), class: $0 }), [() => 'class' in $.get(attrs) ? normalizeClass(['bump', $.get(attrs).class]) : 'bump']);
	var text = $.only_child(button);
	$.template_effect(($0, $1) => $.set_text(text, `${$0 ?? ''}: ${$1 ?? ''}`), [() => toDisplayString(label()), () => toDisplayString($.get(count))]);
	$.append($$anchor, button);
	$.pop();
}
