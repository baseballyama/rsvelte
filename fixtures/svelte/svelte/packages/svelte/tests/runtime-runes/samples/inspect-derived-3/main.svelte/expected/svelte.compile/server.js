import * as $ from 'svelte/internal/server';
import List from './List.svelte';
import Item from './Item.svelte';

export default function Main($$renderer) {
	let selectedIndex = 0;
	let selectedValue = $.derived(() => `${selectedIndex}`);

	const changeSelection = () => {
		selectedIndex = (selectedIndex + 1) % 3;
	};

	List($$renderer, {
		selectedValue: selectedValue(),
		children: ($$renderer) => {
			Item($$renderer, {
				value: '0',
				children: ($$renderer) => {
					$$renderer.push(`<!---->First`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Item($$renderer, {
				value: '1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Second`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Item($$renderer, {
				value: '2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Third`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <button>Change Selection</button>`);
}