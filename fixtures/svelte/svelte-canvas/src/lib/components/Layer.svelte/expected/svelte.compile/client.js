import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { register } from '../util/registerLayer';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<div></div>`);

export default function Layer($$anchor, $$props) {
	$.push($$props, true);

	const layer = $.rest_props($$props, rest_excludes);
	const layerId = register(layer);
	var div = root();

	$.template_effect(() => $.set_attribute(div, 'data-layer-id', layerId));
	$.append($$anchor, div);
	$.pop();
}