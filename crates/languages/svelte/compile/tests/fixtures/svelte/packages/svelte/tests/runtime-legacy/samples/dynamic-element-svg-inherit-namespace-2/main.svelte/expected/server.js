import * as $ from 'svelte/internal/server';
import Svg from "./svg.svelte";

export default function Main($$renderer) {
	let tag = "path";

	Svg($$renderer, {
		children: ($$renderer) => {
			$.element($$renderer, tag, () => {
				$$renderer.push(` d="M21 12a9 9 0 1 1-6.219-8.56"`);
			});
		},
		$$slots: { default: true }
	});
}