import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_html(`<div class="circle svelte-d61hq5"></div>`);
var root_1 = $.from_html(`<div class="dot-row"><div class="line svelte-d61hq5"></div> <!></div>`);
var root_2 = $.from_html(`<div class="dot-plot"></div>`);

export default function ClevelandDotPlot_percent_range_html($$anchor, $$props) {
	$.push($$props, true);

	const $yScale = () => $.store_get(yScale, '$yScale', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const $yGet = () => $.store_get(yGet, '$yGet', $$stores);
	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $zScale = () => $.store_get(zScale, '$zScale', $$stores);
	const $config = () => $.store_get(config, '$config', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, xGet, yGet, zScale, yScale, config } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {number} [r=5] - The circle radius.
	 */
	/** @type {Props} */
	let r = $.prop($$props, 'r', 3, 5);

	let midHeight = $.derived(() => $yScale().bandwidth() / 2);
	var div = root_2();

	$.each(div, 5, $data, $.index, ($$anchor, row) => {
		const scaledYValue = $.derived(() => $yGet()($.get(row)));
		const scaledXValues = $.derived(() => $xGet()($.get(row)));
		var div_1 = root_1();
		var div_2 = $.child(div_1);
		var node = $.sibling(div_2, 2);

		$.each(node, 17, () => $.get(scaledXValues), $.index, ($$anchor, circleX, i) => {
			var div_3 = root();

			$.template_effect(
				($0) => $.set_style(div_3, `
						left: ${$.get(circleX) ?? ''}%;
						top: ${$.get(scaledYValue) + $.get(midHeight)}%;
						width: ${r() * 2}px;
						height: ${r() * 2}px;
						background: ${$0 ?? ''};
					`),
				[() => $zScale()($config().x[i])]
			);

			$.append($$anchor, div_3);
		});

		$.reset(div_1);

		$.template_effect(
			($0, $1) => $.set_style(div_2, `
					left: ${$0 ?? ''}%;
					top: ${$.get(scaledYValue) + $.get(midHeight)}%;
					right: ${$1 ?? ''}%;
				`),
			[
				() => Math.min(...$.get(scaledXValues)),
				() => 100 - Math.max(...$.get(scaledXValues))
			]
		);

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}