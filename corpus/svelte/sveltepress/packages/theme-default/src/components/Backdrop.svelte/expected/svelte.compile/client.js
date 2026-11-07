import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<div role="none"></div>`);

export default function Backdrop($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {object} Props
	 * @property {boolean} [show] - Whether the backdrop is visible
	 * @property {number} [top] - The top position of the backdrop
	 * @property {number} [zIndex] - The z-index of the backdrop
	 */
	/** @type {Props} */
	const show = $.prop($$props, 'show', 3, false),
		top = $.prop($$props, 'top', 3, 0),
		zIndex = $.prop($$props, 'zIndex', 3, 900);

	const dispatcher = createEventDispatcher();
	const handleClose = () => dispatcher('close');
	var div = root();
	let classes;
	let styles;

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'backdrop svelte-1xy571e', null, classes, { show: show() });
		styles = $.set_style(div, '', styles, { top: top(), 'z-index': zIndex() });
	});

	$.delegated('click', div, handleClose);
	$.delegated('keyup', div, handleClose);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keyup']);