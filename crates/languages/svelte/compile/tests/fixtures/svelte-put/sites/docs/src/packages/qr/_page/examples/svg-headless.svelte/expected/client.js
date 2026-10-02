import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createQrSvgString, createQrSvgDataUrl } from '@svelte-put/qr';

var root = $.from_html(`<div class="flex flex-col items-center gap-2"><!> <a class="c-btn" download="qr.svg">Download QR as SVG</a></div>`);

export default function Svg_headless($$anchor, $$props) {
	$.push($$props, true);

	const config = { data: 'https://svelte.dev' };
	const dataURL = createQrSvgDataUrl(config);
	const svgString = createQrSvgString(config);
	var div = root();
	var node = $.child(div);

	$.html(node, () => svgString);

	var a = $.sibling(node, 2);

	$.reset(div);
	$.template_effect(() => $.set_attribute(a, 'href', dataURL));
	$.append($$anchor, div);
	$.pop();
}