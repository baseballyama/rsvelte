import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

import { vModelSelect, vModelText, toDisplayString } from 'vue';

import { untrack } from 'svelte';

var root = $.from_html(`<select class="size"><option>small</option><option>medium</option><option>large</option></select><input class="note"/><p class="summary"> </p>`, 1);

export default function Form_controls_vue($$anchor, $$props) {
	$.push($$props, true);
	const vmodelBindings = new WeakMap();
	function vmodel(dir, value_1, modifiers, props) {
		if (dir.deep) traverse(value_1);
		return (el) => untrack(() => {
			const vnode = { props: props };
			let binding = vmodelBindings.get(el);
			if (binding === undefined) {
				binding = { value: value_1, oldValue: undefined, modifiers: modifiers };
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
	let size = $.state('m');
	let note = $.state('none');
	var fragment = root();
	var select = $.first_child(fragment);
	var option = $.child(select);
	option.value = option.__value = 's';
	var option_1 = $.sibling(option);
	option_1.value = option_1.__value = 'm';
	var option_2 = $.sibling(option_1);
	option_2.value = option_2.__value = 'l';
	$.reset(select);
	$.attach(select, () => vmodel(vModelSelect, $.get(size), {}, { 'onUpdate:modelValue': (value) => $.set(size, value, true) }));
	var input = $.sibling(select);
	$.attach(input, () => vmodel(vModelText, $.get(note), { lazy: true }, { 'onUpdate:modelValue': (value_2) => $.set(note, value_2, true) }));
	var p = $.sibling(input);
	var text = $.only_child(p);
	$.template_effect(($0, $1) => $.set_text(text, `size ${$0 ?? ''}, note ${$1 ?? ''}`), [() => toDisplayString($.get(size)), () => toDisplayString($.get(note))]);
	$.append($$anchor, fragment);
	$.pop();
}
