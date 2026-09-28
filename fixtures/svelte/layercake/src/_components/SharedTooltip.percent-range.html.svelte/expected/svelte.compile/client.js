import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { format } from 'd3-format';
import QuadTree from './QuadTree.percent-range.html.svelte';

var root = $.from_html(`<div class="row"><span class="key svelte-1c6q2af"> </span> </div>`);
var root_1 = $.from_html(`<div class="line svelte-1c6q2af"></div> <div class="tooltip svelte-1c6q2af"><div class="title svelte-1c6q2af"> </div> <!></div>`, 1);

export default function SharedTooltip_percent_range_html($$anchor, $$props) {
	$.push($$props, true);

	const $config = () => $.store_get(config, '$config', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const $width = () => $.store_get(width, '$width', $$stores);
	const $yScale = () => $.store_get(yScale, '$yScale', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, width, yScale, config } = getContext('LayerCake');
	const commas = format(',');
	const titleCase = (d) => d.replace(/^\w/, (w) => w.toUpperCase());

	/**
	 * @typedef {Object} Props
	 * @property {Function} [formatTitle=d => d] - A function to format the tooltip title, which is `$config.x`.
	 * @property {Function} [formatKey = d => titleCase(d)] - A function to format the series name.
	 * @property {Function} [formatValue = d => (isNaN(+d) ? d : commas(d))] - A function to format the value.
	 * @property {number} [offset=-20] - A y-offset from the hover point, in pixels.
	 * @property {Array} [dataset] - The dataset to work off of—defaults to $data if left unset. You can pass something custom in here in case you don't want to use the main data or it's in a strange format.
	 */
	/** @type {Props} */
	let formatTitle = $.prop($$props, 'formatTitle', 3, (d) => d),
		formatKey = $.prop($$props, 'formatKey', 3, (d) => titleCase(d)),
		formatValue = $.prop($$props, 'formatValue', 3, (d) => isNaN(+d) ? d : commas(d)),
		offset = $.prop($$props, 'offset', 19, () => -20);

	const w = 150;
	const w2 = w / 2;

	/* --------------------------------------------
	 * Sort the keys by the highest value
	 */
	function sortResult(result) {
		if (Object.keys(result).length === 0) return [];

		const rows = Object.keys(result).filter((d) => d !== $config().x).map((key) => {
			return { key, value: result[key] };
		}).sort((a, b) => b.value - a.value);

		return rows;
	}

	{
		const children = ($$anchor, $$arg0) => {
			let x = () => ($$arg0?.()).x;
			let y = () => ($$arg0?.()).y;
			let visible = () => ($$arg0?.()).visible;
			let found = () => ($$arg0?.()).found;
			let e = () => ($$arg0?.()).e;
			const foundSorted = $.derived(() => sortResult(found()));
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root_1();
					var div = $.first_child(fragment_2);
					var div_1 = $.sibling(div, 2);
					var div_2 = $.child(div_1);
					var text = $.only_child(div_2, true);
					var node_1 = $.sibling(div_2, 2);

					$.each(node_1, 17, () => $.get(foundSorted), $.index, ($$anchor, row) => {
						var div_3 = root();
						var span = $.child(div_3);
						var text_1 = $.only_child(span);
						var text_2 = $.sibling(span);

						$.reset(div_3);

						$.template_effect(
							($0, $1) => {
								$.set_text(text_1, `${$0 ?? ''}:`);
								$.set_text(text_2, ` ${$1 ?? ''}`);
							},
							[
								() => formatKey()($.get(row).key),
								() => formatValue()($.get(row).value)
							]
						);

						$.append($$anchor, div_3);
					});

					$.reset(div_1);

					$.template_effect(
						($0, $1, $2) => {
							$.set_style(div, `left:${x() / 100 * $width()}px;`);

							$.set_style(div_1, `
	        width:150px;
	        display: ${visible() ? 'block' : 'none'};
	        top:calc(${$0 ?? ''}% + ${offset() ?? ''}px);
	        left:${$1 ?? ''}px;`);

							$.set_text(text, $2);
						},
						[
							() => $yScale()($.get(foundSorted)[0].value),
							() => Math.min(Math.max(w2, x() / 100 * $width()), $width() - w2),
							() => formatTitle()(found()[$config().x])
						]
					);

					$.append($$anchor, fragment_2);
				};

				$.if(node, ($$render) => {
					if (visible() === true) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => $$props.dataset || $data());

		QuadTree($$anchor, {
			get dataset() {
				return $.get($0);
			},
			y: 'x',
			children,
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}