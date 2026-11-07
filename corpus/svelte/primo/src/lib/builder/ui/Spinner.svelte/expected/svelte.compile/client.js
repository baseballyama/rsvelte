import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '@iconify/svelte';

var root = $.from_html(`<div class="Spinner svelte-16qjy1n"><!></div>`);

export default function Spinner($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {Object} Props
	 * @property {string} [variant]
	 */
	/** @type {Props} */
	let variant = $.prop($$props, 'variant', 3, 'dots');

	const icon = ({
		dots: 'eos-icons:three-dots-loading',
		loop: 'line-md:loading-twotone-loop'
	})[variant()];

	var div = root();
	var node = $.child(div);

	Icon(node, {
		get icon() {
			return icon;
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}