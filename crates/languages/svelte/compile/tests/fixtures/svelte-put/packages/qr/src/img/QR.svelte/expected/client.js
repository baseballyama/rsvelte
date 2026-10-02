import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createQrPngDataUrl, createQrSvgDataUrl } from '../qr/index.js';
import { toDataURL } from './index.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'data',
	'margin',
	'shape',
	'logo',
	'logoRatio',
	'moduleFill',
	'anchorInnerFill',
	'anchorOuterFill',
	'backgroundFill',
	'version',
	'typeNumber',
	'correction',
	'errorCorrectionLevel',
	'onqrinit',
	'onqrlogofetch',
	'img'
]);

var root = $.from_html(`<img/>`);

export default function QR($$anchor, $$props) {
	$.push($$props, true);

	/** @type {import('./QR.svelte').QRProps} */
	let rest = $.rest_props($$props, rest_excludes);

	let config = $.derived(() => ({
		data: $$props.data,
		anchorInnerFill: $$props.anchorInnerFill,
		anchorOuterFill: $$props.anchorOuterFill,
		logoRatio: $$props.logoRatio,
		margin: $$props.margin,
		moduleFill: $$props.moduleFill,
		shape: $$props.shape,
		version: $$props.version,
		correction: $$props.correction,
		typeNumber: $$props.typeNumber,
		errorCorrectionLevel: $$props.errorCorrectionLevel
	}));

	let srcSvgPlaceholder = $.derived(() => createQrSvgDataUrl($.get(config)));

	let base64pngPromise = $.derived(async () => {
		/** @type {string | undefined}*/
		let logoData = undefined;

		if ($$props.logo?.startsWith('http')) {
			logoData = await toDataURL($$props.logo);
			$$props.onqrlogofetch?.($$props.logo);
		}

		return await createQrPngDataUrl({
			...$.get(config),
			backgroundFill: $$props.backgroundFill,
			width: parseInt($$props.width),
			height: parseInt($$props.height),
			logo: logoData
		});
	});

	/** @type {HTMLImageElement | undefined}*/
	let element = $.state(undefined);

	$.user_effect(() => {
		if ($.get(element)) $$props.onqrinit?.($.get(element));
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => $.get(base64pngPromise),
		($$anchor) => {
			var img_2 = root();

			$.attribute_effect(img_2, () => ({ src: $.get(srcSvgPlaceholder), ...rest }));
			$.replay_events(img_2);
			$.append($$anchor, img_2);
		},
		($$anchor, base64) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.snippet(node_2, () => $$props.img, () => ({ src: $.get(base64) }));
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var img_1 = root();

					$.attribute_effect(img_1, () => ({ src: $.get(base64), ...rest }));
					$.bind_this(img_1, ($$value) => $.set(element, $$value), () => $.get(element));
					$.replay_events(img_1);
					$.append($$anchor, img_1);
				};

				$.if(node_1, ($$render) => {
					if ($$props.img) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		}
	);

	$.append($$anchor, fragment);
	$.pop();
}