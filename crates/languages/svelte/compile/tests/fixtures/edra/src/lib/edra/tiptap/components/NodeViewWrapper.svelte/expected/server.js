import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function NodeViewWrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			as = 'div',
			class: className,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		let onDragStartCtx = getContext('onDragStart');
		let decorationClassesCtx = getContext('decorationClasses');

		let combinedClass = $.derived(() => [
			typeof decorationClassesCtx === 'function' ? decorationClassesCtx() : decorationClassesCtx,
			className
		].filter(Boolean).join(' ') || undefined);

		$.element(
			$$renderer,
			as,
			() => {
				$$renderer.push(`${$.attributes({
					'data-node-view-wrapper': 'hello',
					class: $.clsx(combinedClass()),
					style: 'white-space: normal',
					...props
				})}`);
			},
			() => {
				if (children) {
					$$renderer.push('<!--[0-->');
					children($$renderer);
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}
		);
	});
}