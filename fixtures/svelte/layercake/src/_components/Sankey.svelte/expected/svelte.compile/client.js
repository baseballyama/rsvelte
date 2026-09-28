import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import * as Sankey from 'd3-sankey';

var root = $.from_svg(`<path fill="none" stroke-opacity="0.5"></path>`);
var root_1 = $.from_svg(`<rect></rect><text class="svelte-13bxiuo"> </text>`, 1);
var root_2 = $.from_svg(`<g class="sankey-layer"><g class="link-group"></g><g class="rect-group"></g></g>`);

export default function Sankey_1($$anchor, $$props) {
	$.push($$props, true);

	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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
	let colorLinks = $.prop($$props, 'colorLinks', 3, () => 'rgba(0, 0, 0, .2)'),
		colorNodes = $.prop($$props, 'colorNodes', 3, () => '#333'),
		colorText = $.prop($$props, 'colorText', 3, () => '#263238'),
		nodeWidth = $.prop($$props, 'nodeWidth', 3, 5),
		nodePadding = $.prop($$props, 'nodePadding', 3, 10),
		linkSort = $.prop($$props, 'linkSort', 3, undefined),
		nodeId = $.prop($$props, 'nodeId', 3, (d) => d.id),
		nodeAlign = $.prop($$props, 'nodeAlign', 19, () => Sankey.sankeyLeft);

	const link = Sankey.sankeyLinkHorizontal();

	/** @type {SankeyGraph|{links: any, nodes: any}} sankeyData */
	let sankeyData = $.state($.proxy({ links: undefined, nodes: undefined }));

	$.user_effect(() => {
		const sankey = Sankey.sankey().nodeAlign(nodeAlign()).nodeWidth(nodeWidth()).nodePadding(nodePadding()).nodeId(nodeId()).size([$width(), $height()]).linkSort(linkSort());

		$.set(sankeyData, sankey($data()), true);
	});

	let fontSize = $.derived(() => $width() <= 320 ? 8 : 12);
	var g = root_2();
	var g_1 = $.child(g);

	$.each(g_1, 21, () => $.get(sankeyData).links, $.index, ($$anchor, d) => {
		var path = root();

		$.template_effect(
			($0, $1) => {
				$.set_attribute(path, 'd', $0);
				$.set_attribute(path, 'stroke', $1);
				$.set_attribute(path, 'stroke-width', $.get(d).width);
			},
			[() => link($.get(d)), () => colorLinks()($.get(d))]
		);

		$.append($$anchor, path);
	});

	$.reset(g_1);

	var g_2 = $.sibling(g_1);

	$.each(g_2, 21, () => $.get(sankeyData).nodes, $.index, ($$anchor, d) => {
		var fragment = root_1();
		var rect = $.first_child(fragment);
		var text = $.sibling(rect);
		var text_1 = $.only_child(text, true);

		$.template_effect(
			($0, $1) => {
				$.set_attribute(rect, 'x', $.get(d).x0);
				$.set_attribute(rect, 'y', $.get(d).y0);
				$.set_attribute(rect, 'height', $.get(d).y1 - $.get(d).y0);
				$.set_attribute(rect, 'width', $.get(d).x1 - $.get(d).x0);
				$.set_attribute(rect, 'fill', $0);
				$.set_attribute(text, 'x', $.get(d).x0 < $width() / 4 ? $.get(d).x1 + 6 : $.get(d).x0 - 6);
				$.set_attribute(text, 'y', ($.get(d).y1 + $.get(d).y0) / 2);
				$.set_attribute(text, 'dy', $.get(fontSize) / 2 - 2);

				$.set_style(text, `fill: ${$1 ?? ''};
							font-size: ${$.get(fontSize) ?? ''}px;
							text-anchor: ${$.get(d).x0 < $width() / 4 ? 'start' : 'end'};`);

				$.set_text(text_1, $.get(d).id);
			},
			[() => colorNodes()($.get(d)), () => colorText()($.get(d))]
		);

		$.append($$anchor, fragment);
	});

	$.reset(g_2);
	$.reset(g);
	$.append($$anchor, g);
	$.pop();
	$$cleanup();
}