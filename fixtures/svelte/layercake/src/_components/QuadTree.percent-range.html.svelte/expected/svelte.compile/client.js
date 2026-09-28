import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { quadtree } from 'd3-quadtree';

var root = $.from_html(`<div class="bg svelte-13mgwg0" role="tooltip"></div> <!>`, 1);

export default function QuadTree_percent_range_html($$anchor, $$props) {
	$.push($$props, true);

	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $yGet = () => $.store_get(yGet, '$yGet', $$stores);
	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, xGet, yGet, width, height } = getContext('LayerCake');
	let visible = $.state(false);
	let found = $.state($.proxy({}));
	let e = $.state($.proxy({}));

	/**
	 * @typedef {Object} Props
	 * @property {string} [x='x'] - The dimension to search across when moving the mouse left and right.
	 * @property {string} [y='y'] - The dimension to search across when moving the mouse up and down.
	 * @property {number|undefined} [searchRadius] - The number of pixels to search around the mouse's location. This is the third argument passed to [`quadtree.find`](https://github.com/d3/d3-quadtree#quadtree_find) and by default a value of `undefined` means an unlimited range.
	 * @property {Array<Object>|undefined} [dataset] - The dataset to work off of—defaults to $data if left unset. You can pass something custom in here in case you don't want to use the main data or it's in a strange format.
	 * @property {import('svelte').Snippet<[any]>} [children]
	 */
	/** @type {Props} */
	let x = $.prop($$props, 'x', 3, 'x'),
		y = $.prop($$props, 'y', 3, 'y');

	let xGetter = $.derived(() => x() === 'x' ? $xGet() : $yGet());
	let yGetter = $.derived(() => y() === 'y' ? $yGet() : $xGet());

	/** @param {MouseEvent} evt*/
	function findItem(evt) {
		$.set(e, evt, true);

		const xLayerKey = /** @type {'layerX'|'layerY'} */ (`layer${x().toUpperCase()}`);
		const yLayerKey = /** @type {'layerX'|'layerY'}*/ (`layer${y().toUpperCase()}`);
		const xLayerVal = evt[xLayerKey] / (x() === 'x' ? $width() : $height()) * 100;
		const yLayerVal = evt[yLayerKey] / (y() === 'y' ? $height() : $width()) * 100;

		$.set(found, $.get(finder).find(xLayerVal, yLayerVal, $$props.searchRadius) || {}, true);
		$.set(visible, Object.keys($.get(found)).length > 0);
	}

	let finder = $.derived(() => quadtree().extent([[-1, -1], [$width() + 1, $height() + 1]]).x($.get(xGetter)).y($.get(yGetter)).addAll($$props.dataset || $data()));
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.sibling(div, 2);

	{
		let $0 = $.derived(() => ({
			x: $.get(xGetter)($.get(found)) || 0,
			y: $.get(yGetter)($.get(found)) || 0,
			found: $.get(found),
			visible: $.get(visible),
			e: $.get(e)
		}));

		$.snippet(node, () => $$props.children ?? $.noop, () => $.get($0));
	}

	$.delegated('mousemove', div, findItem);
	$.delegated('mouseout', div, () => $.set(visible, false));
	$.event('blur', div, () => $.set(visible, false));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['mousemove', 'mouseout']);