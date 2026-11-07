import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { stratify, pack, hierarchy } from 'd3-hierarchy';
import { getContext } from 'svelte';
import { format } from 'd3-format';

var root = $.from_html(`<div class="text value svelte-1rwl0z1"> </div>`);
var root_1 = $.from_html(`<div class="circle-group svelte-1rwl0z1"><div class="circle svelte-1rwl0z1"></div> <div class="text-group svelte-1rwl0z1"><div class="text svelte-1rwl0z1"> </div> <!></div></div>`);
var root_2 = $.from_html(`<div class="circle-pack svelte-1rwl0z1"></div>`);

export default function CirclePack_html($$anchor, $$props) {
	$.push($$props, true);

	const $data = () => $.store_get(data, '$data', $$stores);
	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const titleCase = (d) => d.replace(/^\w/, (w) => w.toUpperCase());
	const commas = format(',');
	const { width, height, data } = getContext('LayerCake');

	/** @typedef {import('d3-hierarchy').HierarchyNode<any>} HierarchyNode */
	/**
	 * @typedef {Object} Props
	 * @property {string} [idKey='id'] - The key on each object where the id value lives.
	 * @property {string} [parentKey] - Set this if you want to define one parent circle. This will give you a [nested](https://layercake.graphics/example/CirclePackNested) graphic versus a [grouping of circles](https://layercake.graphics/example/CirclePack).
	 * @property {string} [valueKey='value'] - The key on each object where the data value lives.
	 * @property {Function} [labelVisibilityThreshold=r => r> 25] - By default, only show the text inside a circle if its radius exceeds a certain size. Provide your own function for different behavior.
	 * @property {string} [fill='#fff'] - The circle's fill color.
	 * @property {string} [stroke='#999'] - The circle's stroke color.
	 * @property {number} [strokeWidth=1] - The circle's stroke width, in pixels.
	 * @property {string} [textColor='#333'] - The label text color.
	 * @property {string} [textStroke='#000'] - The label text's stroke color.
	 * @property {number} [textStrokeWidth=0] - The label text's stroke width, in pixels.
	 * @property {(a: HierarchyNode, b: HierarchyNode) => number} [sortBy=(a, b) => b.value - a.value] - The order in which circle's are drawn. Sorting on the `depth` key is also a popular choice.
	 * @property {number} [spacing=0] - Whitespace padding between each circle, in pixels.
	 */
	/** @type {Props} */
	let idKey = $.prop($$props, 'idKey', 3, 'id'),
		valueKey = $.prop($$props, 'valueKey', 3, 'value'),
		labelVisibilityThreshold = $.prop($$props, 'labelVisibilityThreshold', 3, (r) => r > 25),
		fill = $.prop($$props, 'fill', 3, '#fff'),
		stroke = $.prop($$props, 'stroke', 3, '#999'),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 1),
		textColor = $.prop($$props, 'textColor', 3, '#333'),
		textStroke = $.prop($$props, 'textStroke', 3, '#000'),
		textStrokeWidth = $.prop($$props, 'textStrokeWidth', 3, 0),
		sortBy = $.prop($$props, 'sortBy', 3, (a, b) => b.value - a.value),
		spacing = $.prop($$props, 'spacing', 3, 0);

	/* --------------------------------------------
	 * This component will automatically group your data
	 * into one group if no `parentKey` was passed in.
	 * Stash $data here so we can add our own parent
	 * if there's no `parentKey`
	 */
	let parent = $.derived(() => $$props.parentKey !== undefined ? {} : { [idKey()]: 'all' });

	let dataset = $.derived(() => $$props.parentKey !== undefined ? $data() : [...$data(), $.get(parent)]);

	let stratifier = $.derived(() => stratify().id((d) => d[idKey()]).parentId((d) => {
		if (d[idKey()] === $.get(parent)[idKey()]) return '';
		if ($$props.parentKey === undefined) return $.get(parent)[idKey()];

		return d[$$props.parentKey];
	}));

	let descendants = $.derived(() => pack().size([$width(), $height()]).padding(spacing())(hierarchy($.get(stratifier)($.get(dataset))).sum((d) => {
		return d.data[valueKey()] || 1;
	}).sort(sortBy())).descendants());

	var div = root_2();

	$.each(div, 21, () => $.get(descendants), $.index, ($$anchor, d) => {
		var div_1 = root_1();
		var div_2 = $.child(div_1);
		let styles;
		var div_3 = $.sibling(div_2, 2);
		var div_4 = $.child(div_3);
		var text = $.only_child(div_4, true);
		var node = $.sibling(div_4, 2);

		{
			var consequent = ($$anchor) => {
				var div_5 = root();
				var text_1 = $.only_child(div_5, true);

				$.template_effect(($0) => $.set_text(text_1, $0), [() => commas($.get(d).data.data[valueKey()])]);
				$.append($$anchor, div_5);
			};

			$.if(node, ($$render) => {
				if ($.get(d).data.data[valueKey()]) $$render(consequent);
			});
		}

		$.reset(div_3);
		$.reset(div_1);

		$.template_effect(
			($0, $1, $2) => {
				$.set_attribute(div_1, 'data-id', $.get(d).data.id);
				$.set_attribute(div_1, 'data-visible', $0);

				styles = $.set_style(div_2, '', styles, {
					left: `${$.get(d).x ?? ''}px`,
					top: `${$.get(d).y ?? ''}px`,
					width: `${$.get(d).r * 2}px`,
					height: `${$.get(d).r * 2}px`,
					'background-color': fill(),
					border: `${strokeWidth() ?? ''}px solid ${stroke() ?? ''}`
				});

				$.set_style(div_3, `
						color:${textColor() ?? ''};
						text-shadow:
							-${textStrokeWidth() ?? ''}px -${textStrokeWidth() ?? ''}px 0 ${textStroke() ?? ''},
							${textStrokeWidth() ?? ''}px -${textStrokeWidth() ?? ''}px 0 ${textStroke() ?? ''},
							-${textStrokeWidth() ?? ''}px ${textStrokeWidth() ?? ''}px 0 ${textStroke() ?? ''},
							${textStrokeWidth() ?? ''}px ${textStrokeWidth() ?? ''}px 0 ${textStroke() ?? ''};
						left:${$.get(d).x ?? ''}px;
						top:${$1 ?? ''}px;
					`);

				$.set_text(text, $2);
			},
			[
				() => labelVisibilityThreshold()($.get(d).r),
				() => $.get(d).y - (labelVisibilityThreshold()($.get(d).r) ? 0 : $.get(d).r + 4),
				() => titleCase($.get(d).data.id)
			]
		);

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.template_effect(() => $.set_attribute(div, 'data-has-parent-key', $$props.parentKey !== undefined));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}