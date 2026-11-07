import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_svg(`<rect class="group-rect"></rect>`);
var root_1 = $.from_svg(`<g class="bar-group"></g>`);

export default function BarStacked($$anchor, $$props) {
	$.push($$props, true);

	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const $yGet = () => $.store_get(yGet, '$yGet', $$stores);
	const $yScale = () => $.store_get(yScale, '$yScale', $$stores);
	const $zGet = () => $.store_get(zGet, '$zGet', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, xGet, yGet, zGet, yScale } = getContext('LayerCake');

	let columnWidth = $.derived(() => (d) => {
		const xVals = $xGet()(d);

		return xVals[1] - xVals[0];
	});

	var g = root_1();

	$.each(g, 5, $data, $.index, ($$anchor, series) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.each(node, 17, () => $.get(series), $.index, ($$anchor, d, i) => {
			var rect = root();

			$.set_attribute(rect, 'data-id', i);

			$.template_effect(
				($0, $1, $2, $3, $4) => {
					$.set_attribute(rect, 'x', $0);
					$.set_attribute(rect, 'y', $1);
					$.set_attribute(rect, 'height', $2);
					$.set_attribute(rect, 'width', $3);
					$.set_attribute(rect, 'fill', $4);
				},
				[
					() => $xGet()($.get(d))[0],
					() => $yGet()($.get(d)),
					() => $yScale().bandwidth(),
					() => $.get(columnWidth)($.get(d)),
					() => $zGet()($.get(series))
				]
			);

			$.append($$anchor, rect);
		});

		$.append($$anchor, fragment);
	});

	$.reset(g);
	$.append($$anchor, g);
	$.pop();
	$$cleanup();
}