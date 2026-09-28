import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Output($$anchor) {
	let bounds = $.state(void 0);

	const openDropdown = () => {
		$.set(bounds, getInputPosition(), true);
	};

	const getInputPosition = () => {};
	const calculatePosition = (boundary) => ({});
	let position = $.derived(() => calculatePosition($.get(bounds)));
	var div = root();
	let styles;

	$.template_effect(() => styles = $.set_style(div, '', styles, { top: $.get(position).top }));
	$.append($$anchor, div);
}