import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	treemap as d3treemap,
	treemapBinary,
	treemapDice,
	treemapResquarify,
	treemapSlice,
	treemapSliceDice,
	treemapSquarify
} from 'd3-hierarchy';

import { aspectTile } from '../../utils/treemap.js';
import { getChartContext } from '$lib/contexts/chart.js';

export default function Treemap($$anchor, $$props) {
	$.push($$props, true);

	let tile = $.prop($$props, 'tile', 3, treemapSquarify),
		padding = $.prop($$props, 'padding', 3, 0),
		paddingInner = $.prop($$props, 'paddingInner', 3, 0),
		paddingOuter = $.prop($$props, 'paddingOuter', 3, 0),
		paddingTop = $.prop($$props, 'paddingTop', 3, 0),
		paddingBottom = $.prop($$props, 'paddingBottom', 3, 0),
		maintainAspectRatio = $.prop($$props, 'maintainAspectRatio', 3, false);

	const ctx = getChartContext();

	const tileFunc = $.derived(() => tile() === 'squarify'
		? treemapSquarify
		: tile() === 'resquarify'
			? treemapResquarify
			: tile() === 'binary'
				? treemapBinary
				: tile() === 'dice'
					? treemapDice
					: tile() === 'slice'
						? treemapSlice
						: tile() === 'sliceDice' ? treemapSliceDice : tile());

	const treemapData = $.derived(() => {
		const _treemap = d3treemap().size([ctx.width, ctx.height]).tile(maintainAspectRatio()
			? aspectTile($.get(tileFunc), ctx.width, ctx.height)
			: $.get(tileFunc));

		if (padding()) {
			// Make Typescript happy to pick the correct overload
			// TODO: Better way to do this?
			if (typeof padding() === 'number') {
				_treemap.padding(padding());
			} else {
				_treemap.padding(padding());
			}
		}

		if (paddingInner()) {
			if (typeof paddingInner() === 'number') {
				_treemap.paddingInner(typeof paddingInner() === 'number' ? paddingInner() : paddingInner());
			} else {
				_treemap.paddingInner(paddingInner());
			}
		}

		if (paddingOuter()) {
			if (typeof paddingOuter() === 'number') {
				_treemap.paddingOuter(paddingOuter());
			} else {
				_treemap.paddingOuter(paddingOuter());
			}
		}

		if (paddingTop()) {
			if (typeof paddingTop() === 'number') {
				_treemap.paddingTop(paddingTop());
			} else {
				_treemap.paddingTop(paddingTop());
			}
		}

		if (paddingBottom()) {
			if (typeof paddingBottom() === 'number') {
				_treemap.paddingBottom(paddingBottom());
			} else {
				_treemap.paddingBottom(paddingBottom());
			}
		}

		if ($$props.paddingLeft) {
			if (typeof $$props.paddingLeft === 'number') {
				_treemap.paddingLeft($$props.paddingLeft);
			} else {
				_treemap.paddingLeft($$props.paddingLeft);
			}
		}

		if ($$props.paddingRight) {
			if (typeof $$props.paddingRight === 'number') {
				_treemap.paddingRight($$props.paddingRight);
			} else {
				_treemap.paddingRight($$props.paddingRight);
			}
		}

		if ($$props.hierarchy) {
			const h = $$props.hierarchy.copy();
			const treemapData = _treemap(h);

			return { links: treemapData.links(), nodes: treemapData.descendants() };
		}

		return { links: [], nodes: [] };
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ nodes: $.get(treemapData).nodes }));
	$.append($$anchor, fragment);
	$.pop();
}