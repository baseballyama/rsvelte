import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

import { vModelCheckbox, toDisplayString } from 'vue';

import { untrack } from 'svelte';

var root = $.from_html(`<label><input type="checkbox" class="agree"/> I agree</label><p class="status"> </p><button class="submit">continue</button>`, 1);

export default function Checkbox_vue($$anchor, $$props) {
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
	function includeBooleanAttr(value_2) {
		return !!value_2 || value_2 === '';
	}
	let agreed = $.state(false);
	var fragment = root();
	var label = $.first_child(fragment);
	var input = $.child(label);
	$.attach(input, () => vmodel(vModelCheckbox, $.get(agreed), {}, { 'onUpdate:modelValue': (value) => $.set(agreed, value, true), type: 'checkbox' }));
	$.next();
	$.reset(label);
	var p = $.sibling(label);
	var text = $.only_child(p, true);
	var button = $.sibling(p);
	$.template_effect(($0, $1) => {
		$.set_text(text, $0);
		button.disabled = $1;
	}, [() => toDisplayString($.get(agreed) ? 'agreed' : 'not yet'), () => includeBooleanAttr(!$.get(agreed))]);
	$.append($$anchor, fragment);
	$.pop();
}
