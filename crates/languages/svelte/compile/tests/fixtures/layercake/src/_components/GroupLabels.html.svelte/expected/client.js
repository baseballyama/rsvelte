import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { max } from 'd3-array';

var root = $.from_html(`<div class="label svelte-12uco9e"> </div>`);

export default function GroupLabels_html($$anchor, $$props) {
	$.push($$props, true);

	const $xScale = () => $.store_get(xScale, '$xScale', $$stores);
	const $x = () => $.store_get(x, '$x', $$stores);
	const $xRange = () => $.store_get(xRange, '$xRange', $$stores);
	const $yScale = () => $.store_get(yScale, '$yScale', $$stores);
	const $y = () => $.store_get(y, '$y', $$stores);
	const $yRange = () => $.store_get(yRange, '$yRange', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const $z = () => $.store_get(z, '$z', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, x, y, xScale, yScale, xRange, yRange, z } = getContext('LayerCake');

	/* --------------------------------------------
	 * Title case the first letter
	 */
	const cap = (val) => val.replace(/^\w/, (d) => d.toUpperCase());

	/* --------------------------------------------
	 * Put the label on the highest value
	 */
	let left = $.derived(() => (values) => $xScale()(max(values, $x())) / Math.max(...$xRange()));

	let top = $.derived(() => (values) => $yScale()(max(values, $y())) / Math.max(...$yRange()));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 1, $data, $.index, ($$anchor, group) => {
		var div = root();
		var text = $.only_child(div, true);

		$.template_effect(
			($0, $1, $2) => {
				$.set_style(div, `
      top:${$0 ?? ''}%;
      left:${$1 ?? ''}%;
    `);

				$.set_text(text, $2);
			},
			[
				() => $.get(top)($.get(group).values) * 100,
				() => $.get(left)($.get(group).values) * 100,
				() => cap($z()($.get(group)))
			]
		);

		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}