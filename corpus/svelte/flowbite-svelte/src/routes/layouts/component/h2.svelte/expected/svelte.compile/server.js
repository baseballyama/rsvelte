import * as $ from 'svelte/internal/server';
import Anchor from "./Anchor.svelte";

export default function H2($$renderer, $$props) {
	let { children } = $$props;

	Anchor($$renderer, {
		tag: 'h2',
		class: 'text-2xl leading-tight font-bold text-gray-900 dark:text-white',
		children: ($$renderer) => {
			children($$renderer);
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}