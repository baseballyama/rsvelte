import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createQrSvgParts } from '../qr/index.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'onqrinit',
	'svg',
	'data',
	'anchorInnerFill',
	'anchorOuterFill',
	'logo',
	'logoRatio',
	'margin',
	'moduleFill',
	'shape',
	'correction',
	'version',
	'errorCorrectionLevel',
	'typeNumber'
]);

var root = $.from_svg(`<svg></svg>`);

export default function QR($$anchor, $$props) {
	$.push($$props, true);

	/** @type {import('./QR.svelte').QRProps} */
	let rest = $.rest_props($$props, rest_excludes);

	let parts = $.derived(() => createQrSvgParts({
		data: $$props.data,
		anchorInnerFill: $$props.anchorInnerFill,
		anchorOuterFill: $$props.anchorOuterFill,
		logo: $$props.logo,
		logoRatio: $$props.logoRatio,
		margin: $$props.margin,
		moduleFill: $$props.moduleFill,
		shape: $$props.shape,
		errorCorrectionLevel: $$props.errorCorrectionLevel,
		version: $$props.version,
		correction: $$props.correction,
		typeNumber: $$props.typeNumber
	}));

	let innerHTML = $.derived(() => `${$.get(parts).anchors}${$.get(parts).modules}${$.get(parts).logo}`);

	/** @type {SVGElement | undefined}*/
	let element = $.state(undefined);

	$.user_effect(() => {
		if ($.get(element)) $$props.onqrinit?.($.get(element));
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.svg, () => ({
				attributes: $.get(parts).attributes,
				innerHTML: $.get(innerHTML)
			}));

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var svg_1 = root();

			$.attribute_effect(svg_1, () => ({ ...$.get(parts).attributes, ...rest }));
			$.html(svg_1, () => $.get(innerHTML), true);
			$.reset(svg_1);
			$.bind_this(svg_1, ($$value) => $.set(element, $$value), () => $.get(element));
			$.append($$anchor, svg_1);
		};

		$.if(node, ($$render) => {
			if ($$props.svg) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}