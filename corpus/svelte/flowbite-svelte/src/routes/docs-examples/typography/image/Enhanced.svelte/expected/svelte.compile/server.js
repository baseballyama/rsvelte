import * as $ from 'svelte/internal/server';
import { Img } from "flowbite-svelte";

export default function Enhanced($$renderer) {
	Img($$renderer, {
		caption: 'Default enhanced image',
		size: 'md',
		align: 'center',
		children: ($$renderer) => {
			$$renderer.push(`<enhanced:img src="/src/images/content-gallery-3.png" alt="Default enhanced example"></enhanced:img>`);
		},
		$$slots: { default: true }
	});
}