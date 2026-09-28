import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '@iconify/svelte';

var root = $.from_html(`<button><!></button>`);

export default function RichTextButton($$anchor, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {string} icon
	 * @property {boolean} [active]
	 * @property {boolean} [disabled]
	 * @property {() => void} onclick
	 * @property {string} [aria_label]
	 */
	/** @type {Props} */
	let active = $.prop($$props, 'active', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false);

	var button = root();
	let classes;
	var node = $.child(button);

	Icon(node, {
		get icon() {
			return $$props.icon;
		},
		width: '15',
		height: '15'
	});

	$.reset(button);

	$.template_effect(() => {
		classes = $.set_class(button, 1, 'RichTextButton svelte-ul78pw', null, classes, { active: active(), disabled: disabled() });
		button.disabled = disabled();
		$.set_attribute(button, 'aria-label', $$props.aria_label);
	});

	$.delegated('click', button, function (...$$args) {
		$$props.onclick?.apply(this, $$args);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);