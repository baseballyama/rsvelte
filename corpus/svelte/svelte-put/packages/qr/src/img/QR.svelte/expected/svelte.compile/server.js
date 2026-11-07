import * as $ from 'svelte/internal/server';
import { createQrPngDataUrl, createQrSvgDataUrl } from '../qr/index.js';
import { toDataURL } from './index.js';

export default function QR($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {import('./QR.svelte').QRProps} */
		let {
			data,
			margin,
			shape,
			logo,
			logoRatio,
			moduleFill,
			anchorInnerFill,
			anchorOuterFill,
			backgroundFill,
			version,
			typeNumber,
			correction,
			errorCorrectionLevel,
			onqrinit,
			onqrlogofetch,
			img,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let config = $.derived(() => ({
			data,
			anchorInnerFill,
			anchorOuterFill,
			logoRatio,
			margin,
			moduleFill,
			shape,
			version,
			correction,
			typeNumber,
			errorCorrectionLevel
		}));

		let srcSvgPlaceholder = $.derived(() => createQrSvgDataUrl(config()));

		let base64pngPromise = $.derived(async () => {
			/** @type {string | undefined}*/
			let logoData = undefined;

			if (logo?.startsWith('http')) {
				logoData = await toDataURL(logo);
				onqrlogofetch?.(logo);
			}

			return await createQrPngDataUrl({
				...config(),
				backgroundFill,
				width: parseInt(rest.width),
				height: parseInt(rest.height),
				logo: logoData
			});
		});

		/** @type {HTMLImageElement | undefined}*/
		let element = undefined;

		$.await(
			$$renderer,
			base64pngPromise(),
			() => {
				$$renderer.push(`<img${$.attributes({ src: srcSvgPlaceholder(), ...rest })} onload="this.__e=event" onerror="this.__e=event"/>`);
			},
			(base64) => {
				if (img) {
					$$renderer.push('<!--[0-->');
					img($$renderer, { src: base64 });
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push(`<!--[-1--><img${$.attributes({ src: base64, ...rest })} onload="this.__e=event" onerror="this.__e=event"/>`);
				}

				$$renderer.push(`<!--]-->`);
			}
		);

		$$renderer.push(`<!--]-->`);
	});
}