import * as $ from 'svelte/internal/server';
import { useActions } from './internal/index.js';

export default function SmuiElement($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * The tag name of the element to create.
		 */
		let {
			use = [],
			tag = 'div',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const selfClosing = $.derived(() => [
			'area',
			'base',
			'br',
			'col',
			'embed',
			'hr',
			'img',
			'input',
			'link',
			'meta',
			'param',
			'source',
			'track',
			'wbr'
		].indexOf(tag) > -1);

		let element;

		function getElement() {
			return element;
		}

		if (tag === 'svg') {
			$$renderer.push(`<!--[0--><svg${$.attributes({ ...restProps }, void 0, void 0, void 0, 3)}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></svg>`);
		} else if (selfClosing()) {
			$$renderer.push('<!--[1-->');

			$.element($$renderer, tag, () => {
				$$renderer.push(`${$.attributes({ ...restProps })}`);
			});
		} else {
			$$renderer.push('<!--[-1-->');

			$.element(
				$$renderer,
				tag,
				() => {
					$$renderer.push(`${$.attributes({ ...restProps })}`);
				},
				() => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				}
			);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { getElement });
	});
}