import * as $ from 'svelte/internal/server';
import { QrCodeRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Pattern($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const qrCode = QrCodeRootContext.consume();

		const element = $.derived(() => props.element),
			rest = $.derived(() => $.exclude_from_object(props, ['element']));

		const attributes = $.derived(() => mergeProps(qrCode().getPatternProps(), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><path${$.attributes({ ...attributes() }, void 0, void 0, void 0, 3)}></path>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}