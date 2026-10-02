import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

import { vModelText, toDisplayString } from 'vue';

import { untrack } from 'svelte';

var root = $.from_html(`<label>Name <input class="name"/></label><p class="greeting"> </p><p class="shout"> </p>`, 1);

export default function Text_input_vue($$anchor, $$props) {
	$.push($$props, true);
	const vmodelBindings = new WeakMap();
	function vmodel(dir, value_2, modifiers, props) {
		if (dir.deep) traverse(value_2);
		return (el) => untrack(() => {
			const vnode = { props: props };
			let binding = vmodelBindings.get(el);
			if (binding === undefined) {
				binding = { value: value_2, oldValue: undefined, modifiers: modifiers };
				vmodelBindings.set(el, binding);
				dir.created?.(el, binding, vnode);
				dir.mounted?.(el, binding, vnode);
			} else {
				binding.oldValue = binding.value;
				binding.value = value_2;
				dir.beforeUpdate?.(el, binding, vnode);
				dir.updated?.(el, binding, vnode);
			}
		});
	}
	function traverse(value_2, seen = new Set()) {
		if (typeof value_2 !== 'object' || value_2 === null || seen.has(value_2)) return;
		seen.add(value_2);
		if (Array.isArray(value_2)) for (let i = 0; i < value_2.length; i++) traverse(value_2[i], seen); else if (value_2 instanceof Set || value_2 instanceof Map) value_2.forEach((item) => traverse(item, seen)); else if (Object.prototype.toString.call(value_2) === '[object Object]') {
			const keys = Object.keys(value_2);
			for (let i = 0; i < keys.length; i++) traverse(value_2[keys[i]], seen);
		}
	}
	let name = $.state('world');
	let shout = $.derived(() => $.get(name).toUpperCase());
	var fragment = root();
	var label = $.first_child(fragment);
	var input = $.sibling($.child(label));
	$.attach(input, () => vmodel(vModelText, $.get(name), {}, { 'onUpdate:modelValue': (value_1) => $.set(name, value_1, true) }));
	$.reset(label);
	var p = $.sibling(label);
	var text = $.only_child(p);
	var p_1 = $.sibling(p);
	var text_1 = $.only_child(p_1);
	$.template_effect(($0, $1, $2) => {
		$.set_text(text, `Hello, ${$0 ?? ''}!`);
		$.set_text(text_1, `${$1 ?? ''} (${$2 ?? ''})`);
	}, [() => toDisplayString($.get(name)), () => toDisplayString($.get(shout)), () => toDisplayString($.get(name).length)]);
	$.append($$anchor, fragment);
	$.pop();
}
