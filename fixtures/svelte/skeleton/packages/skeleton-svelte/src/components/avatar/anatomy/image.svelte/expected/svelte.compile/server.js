import * as $ from 'svelte/internal/server';
import { AvatarRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Image($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const avatar = AvatarRootContext.consume();

		const element = $.derived(() => props.element),
			rest = $.derived(() => $.exclude_from_object(props, ['element']));

		const attributes = $.derived(() => mergeProps(avatar().getImageProps(), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><img${$.attributes({ ...attributes() })} onload="this.__e=event" onerror="this.__e=event"/>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}