import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";

export default function Floating_layer_content_static($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { content, onPlaced } = $$props;

		onMount(() => {
			onPlaced?.();
		});

		content?.($$renderer, { props: {}, wrapperProps: {} });
		$$renderer.push(`<!---->`);
	});
}