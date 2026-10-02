import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { area } from 'd3-shape';

var root = $.from_svg(`<path class="path-area"></path>`);
var root_1 = $.from_svg(`<g class="area-group"></g>`);

export default function AreaStacked($$anchor, $$props) {
	$.push($$props, true);

	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $yScale = () => $.store_get(yScale, '$yScale', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const $zGet = () => $.store_get(zGet, '$zGet', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, xGet, yScale, zGet } = getContext('LayerCake');
	let areaGen = $.derived(() => area().x((d) => $xGet()(d)).y0((d) => $yScale()(d[0])).y1((d) => $yScale()(d[1])));
	var g = root_1();

	$.each(g, 5, $data, $.index, ($$anchor, d) => {
		var path = root();

		$.template_effect(
			($0, $1) => {
				$.set_attribute(path, 'd', $0);
				$.set_attribute(path, 'fill', $1);
			},
			[() => $.get(areaGen)($.get(d)), () => $zGet()($.get(d))]
		);

		$.append($$anchor, path);
	});

	$.reset(g);
	$.append($$anchor, g);
	$.pop();
	$$cleanup();
}