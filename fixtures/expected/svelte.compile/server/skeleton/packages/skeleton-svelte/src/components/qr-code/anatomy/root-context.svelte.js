import * as $ from 'svelte/internal/server';
import { QrCodeRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const qrCode = QrCodeRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, qrCode);
		$$renderer.push(`<!---->`);
	});
}