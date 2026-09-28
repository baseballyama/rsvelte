import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_svg(`<path class="path-line svelte-1e7dnfv"></path>`);

export default function Line($$anchor, $$props) {
	$.push($$props, true);

	const $data = () => $.store_get(data, '$data', $$stores);
	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $yGet = () => $.store_get(yGet, '$yGet', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, xGet, yGet } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {string} [stroke='#ab00d6'] - The shape's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color.
	 */
	/** @type {Props} */
	let stroke = $.prop($$props, 'stroke', 3, '#ab00d6');

	let path = $.derived(() => 'M' + $data().map((d) => {
		return $xGet()(d) + ',' + $yGet()(d);
	}).join('L'));

	var path_1 = root();

	$.template_effect(() => {
		$.set_attribute(path_1, 'd', $.get(path));
		$.set_attribute(path_1, 'stroke', stroke());
	});

	$.append($$anchor, path_1);
	$.pop();
	$$cleanup();
}