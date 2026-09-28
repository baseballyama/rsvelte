import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = 'A';

	$$renderer.push(`<input class="svelte-1oyxx9b"/> `);

	$$renderer.select(
		{ value, class: '' },
		($$renderer) => {
			$$renderer.push(`<button class="svelte-1oyxx9b"><selectedcontent class="svelte-1oyxx9b"></selectedcontent></button>`);

			$$renderer.option(
				{ class: '' },
				($$renderer) => {
					$$renderer.push(`A`);
				},
				'svelte-1oyxx9b'
			);

			$$renderer.option(
				{ class: '' },
				($$renderer) => {
					$$renderer.push(`B`);
				},
				'svelte-1oyxx9b'
			);

			$$renderer.option(
				{ class: '' },
				($$renderer) => {
					$$renderer.push(`C`);
				},
				'svelte-1oyxx9b'
			);
		},
		'svelte-1oyxx9b',
		void 0,
		void 0,
		void 0,
		true
	);
}