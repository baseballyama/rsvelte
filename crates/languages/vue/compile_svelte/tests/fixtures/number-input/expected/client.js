import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

import { vModelText, toDisplayString } from 'vue';

import { untrack } from 'svelte';

var root = $.from_html(`<input type="number"/><p> </p>`, 1);

export default function Number_input_vue($$anchor, $$props) {
	$.push($$props, true);
	const vmodelBindings = new WeakMap();
	function vmodel(dir, value_1, modifiers, props) {
		if (dir.deep) traverse(value_1);
		return (el) => untrack(() => {
			const vnode = { props };
			let binding = vmodelBindings.get(el);
			if (binding === undefined) {
				binding = { value: value_1, oldValue: undefined, modifiers };
				vmodelBindings.set(el, binding);
				dir.created?.(el, binding, vnode);
				dir.mounted?.(el, binding, vnode);
			} else {
				binding.oldValue = binding.value;
				binding.value = value_1;
				dir.beforeUpdate?.(el, binding, vnode);
				dir.updated?.(el, binding, vnode);
			}
		});
	}
	function traverse(value_1, seen = new Set()) {
		if (typeof value_1 !== 'object' || value_1 === null || seen.has(value_1)) return;
		seen.add(value_1);
		if (Array.isArray(value_1)) for (let i = 0; i < value_1.length; i++) traverse(value_1[i], seen); else if (value_1 instanceof Set || value_1 instanceof Map) value_1.forEach((item) => traverse(item, seen)); else if (Object.prototype.toString.call(value_1) === '[object Object]') {
			const keys = Object.keys(value_1);
			for (let i = 0; i < keys.length; i++) traverse(value_1[keys[i]], seen);
		}
	}
	let n = $.state(1);
	var fragment = root();
	var input = $.first_child(fragment);
	$.attach(input, () => vmodel(vModelText, $.get(n), {}, { 'onUpdate:modelValue': (value) => $.set(n, value, true), type: 'number' }));
	var p = $.sibling(input);
	var text = $.only_child(p);
	$.template_effect(($0, $1, $2) => $.set_text(text, `${$0 ?? ''}: ${$1 ?? ''} + 1 = ${$2 ?? ''}`), [() => toDisplayString(typeof $.get(n)), () => toDisplayString($.get(n)), () => toDisplayString($.get(n) + 1)]);
	$.append($$anchor, fragment);
	$.pop();
}
