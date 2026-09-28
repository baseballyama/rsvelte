import * as $ from 'svelte/internal/server';

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

export default function Treemap($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			hierarchy,
			tile = treemapSquarify,
			padding = 0,
			paddingInner = 0,
			paddingOuter = 0,
			paddingTop = 0,
			paddingBottom = 0,
			paddingLeft,
			paddingRight,
			maintainAspectRatio = false,
			children
		} = $$props;

		const ctx = getChartContext();

		const tileFunc = $.derived(() => tile === 'squarify'
			? treemapSquarify
			: tile === 'resquarify'
				? treemapResquarify
				: tile === 'binary'
					? treemapBinary
					: tile === 'dice'
						? treemapDice
						: tile === 'slice'
							? treemapSlice
							: tile === 'sliceDice' ? treemapSliceDice : tile);

		const treemapData = $.derived(() => {
			const _treemap = d3treemap().size([ctx.width, ctx.height]).tile(maintainAspectRatio
				? aspectTile(tileFunc(), ctx.width, ctx.height)
				: tileFunc());

			if (padding) {
				// Make Typescript happy to pick the correct overload
				// TODO: Better way to do this?
				if (typeof padding === 'number') {
					_treemap.padding(padding);
				} else {
					_treemap.padding(padding);
				}
			}

			if (paddingInner) {
				if (typeof paddingInner === 'number') {
					_treemap.paddingInner(typeof paddingInner === 'number' ? paddingInner : paddingInner);
				} else {
					_treemap.paddingInner(paddingInner);
				}
			}

			if (paddingOuter) {
				if (typeof paddingOuter === 'number') {
					_treemap.paddingOuter(paddingOuter);
				} else {
					_treemap.paddingOuter(paddingOuter);
				}
			}

			if (paddingTop) {
				if (typeof paddingTop === 'number') {
					_treemap.paddingTop(paddingTop);
				} else {
					_treemap.paddingTop(paddingTop);
				}
			}

			if (paddingBottom) {
				if (typeof paddingBottom === 'number') {
					_treemap.paddingBottom(paddingBottom);
				} else {
					_treemap.paddingBottom(paddingBottom);
				}
			}

			if (paddingLeft) {
				if (typeof paddingLeft === 'number') {
					_treemap.paddingLeft(paddingLeft);
				} else {
					_treemap.paddingLeft(paddingLeft);
				}
			}

			if (paddingRight) {
				if (typeof paddingRight === 'number') {
					_treemap.paddingRight(paddingRight);
				} else {
					_treemap.paddingRight(paddingRight);
				}
			}

			if (hierarchy) {
				const h = hierarchy.copy();
				const treemapData = _treemap(h);

				return { links: treemapData.links(), nodes: treemapData.descendants() };
			}

			return { links: [], nodes: [] };
		});

		children?.($$renderer, { nodes: treemapData().nodes });
		$$renderer.push(`<!---->`);
	});
}