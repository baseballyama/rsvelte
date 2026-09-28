import * as $ from 'svelte/internal/server';

export default function ArrowheadMarker($$renderer, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {string} [fill='#000'] - The arrowhead's fill color.
	 * @property {string} [stroke='#000'] - The arrowhead's stroke color.
	 */
	/** @type {Props} */
	let { fill = '#000', stroke = '#000' } = $$props;

	$$renderer.push(`<marker id="arrowhead" viewBox="-10 -10 20 20" markerWidth="17" markerHeight="17" orient="auto"><path d="M-6,-6 L 0,0 L -6,6"${$.attr('fill', fill)}${$.attr('stroke', stroke)}></path></marker>`);
}