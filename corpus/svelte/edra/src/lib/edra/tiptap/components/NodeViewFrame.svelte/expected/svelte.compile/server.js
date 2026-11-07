import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';

export default function NodeViewFrame($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			component: Component,
			onDragStart,
			decorationClasses,
			$$slots,
			$$events,
			...props
		} = $$props;

		setContext('onDragStart', () => onDragStart);
		setContext('decorationClasses', () => decorationClasses);

		if (Component) {
			$$renderer.push('<!--[-->');
			Component($$renderer, $.spread_props([props]));
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}