import * as $ from 'svelte/internal/server';
import { QrCodeRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Download_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const qrCode = QrCodeRootContext.consume();

		const mimeType = $.derived(() => props.mimeType),
			fileName = $.derived(() => props.fileName),
			quality = $.derived(() => props.quality),
			element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			rest = $.derived(() => $.exclude_from_object(props, ['mimeType', 'fileName', 'quality', 'element', 'children']));

		const attributes = $.derived(() => mergeProps(
			qrCode().getDownloadTriggerProps({
				mimeType: mimeType(),
				fileName: fileName(),
				quality: quality()
			}),
			rest()
		));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attributes({ ...attributes() })}>`);
			children()?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}