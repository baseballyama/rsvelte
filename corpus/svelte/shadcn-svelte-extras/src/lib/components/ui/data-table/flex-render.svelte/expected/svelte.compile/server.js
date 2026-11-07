import * as $ from 'svelte/internal/server';
import { RenderComponentConfig, RenderSnippetConfig } from './render-helpers.js';

export default function Flex_render($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** The cell or header field of the current cell's column definition. */
		/** The result of the `getContext()` function of the header or cell */
		/** Used to pass attachments that can't be gotten through context */
		let { content, context, attach } = $$props;

		if (typeof content === 'string') {
			$$renderer.push(`<!--[0-->${$.escape(content)}`);
		} else if (content instanceof Function) {
			$$renderer.push('<!--[1-->');

			const result = content(context);

			if (result instanceof RenderComponentConfig) {
				$$renderer.push('<!--[0-->');

				const { component: Component, props } = result;

				if (Component) {
					$$renderer.push('<!--[-->');
					Component($$renderer, $.spread_props([props, { attach }]));
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else if (result instanceof RenderSnippetConfig) {
				$$renderer.push('<!--[1-->');

				const { snippet, params } = result;

				snippet($$renderer, { ...params, attach });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(result)}`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}