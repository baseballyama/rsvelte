import * as $ from 'svelte/internal/server';
import { createQrSvgParts } from '../qr/index.js';

export default function QR($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {import('./QR.svelte').QRProps} */
		let {
			onqrinit,
			svg,
			data,
			anchorInnerFill,
			anchorOuterFill,
			logo,
			logoRatio,
			margin,
			moduleFill,
			shape,
			correction,
			version,
			errorCorrectionLevel,
			typeNumber,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let parts = $.derived(() => createQrSvgParts({
			data,
			anchorInnerFill,
			anchorOuterFill,
			logo,
			logoRatio,
			margin,
			moduleFill,
			shape,
			errorCorrectionLevel,
			version,
			correction,
			typeNumber
		}));

		let innerHTML = $.derived(() => `${parts().anchors}${parts().modules}${parts().logo}`);

		/** @type {SVGElement | undefined}*/
		let element = undefined;

		if (svg) {
			$$renderer.push('<!--[0-->');
			svg($$renderer, { attributes: parts().attributes, innerHTML: innerHTML() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><svg${$.attributes({ ...parts().attributes, ...rest }, void 0, void 0, void 0, 3)}>${$.html(innerHTML())}</svg>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}