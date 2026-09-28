import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_svg(`<rect class="group-rect"></rect>`);
var root_1 = $.from_svg(`<g class="column-group"></g>`);

export default function ColumnStacked($$anchor, $$props) {
	$.push($$props, true);

	const $data = () => $.store_get(data, '$data', $$stores);
	const $yGet = () => $.store_get(yGet, '$yGet', $$stores);
	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $xScale = () => $.store_get(xScale, '$xScale', $$stores);
	const $zGet = () => $.store_get(zGet, '$zGet', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, xGet, yGet, zGet, xScale } = getContext('LayerCake');
	var g = root_1();

	$.each(g, 5, $data, $.index, ($$anchor, series, i) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.each(node, 17, () => $.get(series), $.index, ($$anchor, d) => {
			const yVals = $.derived(() => $yGet()($.get(d)));
			const columnHeight = $.derived(() => $.get(yVals)[0] - $.get(yVals)[1]);
			var rect = root();

			$.set_attribute(rect, 'data-id', i);

			$.template_effect(
				($0, $1, $2) => {
					$.set_attribute(rect, 'x', $0);
					$.set_attribute(rect, 'y', $.get(yVals)[1]);
					$.set_attribute(rect, 'width', $1);
					$.set_attribute(rect, 'height', $.get(columnHeight));
					$.set_attribute(rect, 'fill', $2);
				},
				[
					() => $xGet()($.get(d)),
					() => $xScale().bandwidth(),
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