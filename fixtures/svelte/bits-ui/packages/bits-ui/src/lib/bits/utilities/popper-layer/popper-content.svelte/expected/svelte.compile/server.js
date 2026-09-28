import * as $ from 'svelte/internal/server';
import FloatingLayerContentStatic from "../floating-layer/components/floating-layer-content-static.svelte";
import FloatingLayerContent from "../floating-layer/components/floating-layer-content.svelte";

export default function Popper_content($$renderer, $$props) {
	let {
		content,
		isStatic = false,
		onPlaced,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	if (isStatic) {
		$$renderer.push('<!--[0-->');
		FloatingLayerContentStatic($$renderer, { content, onPlaced });
	} else {
		$$renderer.push('<!--[-1-->');
		FloatingLayerContent($$renderer, $.spread_props([{ content, onPlaced }, restProps]));
	}

	$$renderer.push(`<!--]-->`);
}