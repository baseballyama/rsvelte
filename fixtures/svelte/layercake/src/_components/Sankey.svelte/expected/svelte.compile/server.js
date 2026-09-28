import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import * as Sankey from 'd3-sankey';

export default function Sankey_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, width, height } = getContext('LayerCake');

		/**
		 * @typedef {(
		 *   import('d3-sankey').sankeyLeft |
		 *   import('d3-sankey').sankeyRight |
		 *   import('d3-sankey').sankeyCenter |
		 *   import('d3-sankey').sankeyJustify
		 * )} SankeyAlignment
		 */
		/** @typedef {import('d3-sankey').SankeyGraph<any, any>} SankeyGraph */
		/** @typedef {import('d3-sankey').SankeyNodeMinimal<any, any>} SankeyNodeMinimal */
		/** @typedef {import('d3-sankey').SankeyLinkMinimal<any, any>} SankeyLink */
		/**
		 * @typedef {((a: SankeyLink, b: SankeyLink) => (number | undefined | null))} LinkSortFunction
		 */
		/**
		 * @typedef {Object} Props
		 * @property {Function} [colorLinks=() => 'rgba(0, 0, 0, .2)'] - A function to return a color for the links.
		 * @property {Function} [colorNodes=() => '#333'] - A function to return a color for each node.
		 * @property {Function} [colorText=() => '#263238'] - A function to return a color for each text label.
		 * @property {number} [nodeWidth=5] - The width of each node, in pixels, passed to [`sankey.nodeWidth`](https://github.com/d3/d3-sankey#sankey_nodeWidth).
		 * @property {number} [nodePadding=10] - The padding between nodes, passed to [`sankey.nodePadding`](https://github.com/d3/d3-sankey#sankey_nodePadding).
		 * @property {LinkSortFunction|undefined} [linkSort] - How to sort the links, passed to [`sankey.linkSort`](https://github.com/d3/d3-sankey#sankey_linkSort).
		 * @property {(d: SankeyNodeMinimal) => number | string} [nodeId=(d) => d.id] - The ID field accessor, passed to [`sankey.nodeId`](https://github.com/d3/d3-sankey#sankey_nodeId).
		 * @property {SankeyAlignment} [nodeAlign=Sankey.sankeyLeft] - An alignment function to position the Sankey blocks. See the [d3-sankey documentation](https://github.com/d3/d3-sankey#alignments) for more.
		 */
		/** @type {Props} */
		let {
			colorLinks = () => 'rgba(0, 0, 0, .2)',
			colorNodes = () => '#333',
			colorText = () => '#263238',
			nodeWidth = 5,
			nodePadding = 10,
			linkSort = undefined,
			nodeId = (d) => d.id,
			nodeAlign = Sankey.sankeyLeft
		} = $$props;

		const link = Sankey.sankeyLinkHorizontal();

		/** @type {SankeyGraph|{links: any, nodes: any}} sankeyData */
		let sankeyData = { links: undefined, nodes: undefined };

		let fontSize = $.derived(() => $.store_get($$store_subs ??= {}, '$width', width) <= 320 ? 8 : 12);

		$$renderer.push(`<g class="sankey-layer"><g class="link-group"><!--[-->`);

		const each_array = $.ensure_array_like(sankeyData.links);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let d = each_array[$$index];

			$$renderer.push(`<path${$.attr('d', link(d))} fill="none"${$.attr('stroke', colorLinks(d))} stroke-opacity="0.5"${$.attr('stroke-width', d.width)}></path>`);
		}

		$$renderer.push(`<!--]--></g><g class="rect-group"><!--[-->`);

		const each_array_1 = $.ensure_array_like(sankeyData.nodes);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let d = each_array_1[$$index_1];

			$$renderer.push(`<rect${$.attr('x', d.x0)}${$.attr('y', d.y0)}${$.attr('height', d.y1 - d.y0)}${$.attr('width', d.x1 - d.x0)}${$.attr('fill', colorNodes(d))}></rect><text${$.attr('x', d.x0 < $.store_get($$store_subs ??= {}, '$width', width) / 4 ? d.x1 + 6 : d.x0 - 6)}${$.attr('y', (d.y1 + d.y0) / 2)}${$.attr('dy', fontSize() / 2 - 2)}${$.attr_style(`fill: ${$.stringify(colorText(d))}; font-size: ${$.stringify(fontSize())}px; text-anchor: ${d.x0 < $.store_get($$store_subs ??= {}, '$width', width) / 4 ? 'start' : 'end'};`)} class="svelte-13bxiuo">${$.escape(d.id)}</text>`);
		}

		$$renderer.push(`<!--]--></g></g>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}