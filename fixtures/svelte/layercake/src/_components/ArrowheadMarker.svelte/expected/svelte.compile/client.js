import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<marker id="arrowhead" viewBox="-10 -10 20 20" markerWidth="17" markerHeight="17" orient="auto"><path d="M-6,-6 L 0,0 L -6,6"></path></marker>`);

export default function ArrowheadMarker($$anchor, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {string} [fill='#000'] - The arrowhead's fill color.
	 * @property {string} [stroke='#000'] - The arrowhead's stroke color.
	 */
	/** @type {Props} */
	let fill = $.prop($$props, 'fill', 3, '#000'),
		stroke = $.prop($$props, 'stroke', 3, '#000');

	var marker = root();
	var path = $.only_child(marker);

	$.template_effect(() => {
		$.set_attribute(path, 'fill', fill());
		$.set_attribute(path, 'stroke', stroke());
	});

	$.append($$anchor, marker);
}