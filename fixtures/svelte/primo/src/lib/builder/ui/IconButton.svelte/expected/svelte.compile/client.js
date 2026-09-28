import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '@iconify/svelte';

var root = $.from_html(`<button><!></button>`);

export default function IconButton($$anchor, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {string} [icon]
	 * @property {any} [color]
	 * @property {() => void} onclick
	 */
	/** @type {Props} */
	let icon = $.prop($$props, 'icon', 3, 'carbon:overflow-menu-vertical'),
		color = $.prop($$props, 'color', 3, null),
		onclick = $.prop($$props, 'onclick', 3, () => {});

	let clicked = false;
	var button = root();

	$.set_class(button, 1, 'show-menu svelte-rmvwxl', null, {}, { active: clicked });

	let styles;
	var node = $.child(button);

	Icon(node, {
		get icon() {
			return icon();
		}
	});

	$.reset(button);
	$.template_effect(() => styles = $.set_style(button, '', styles, { color: color() }));

	$.delegated('click', button, function (...$$args) {
		onclick()?.apply(this, $$args);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);