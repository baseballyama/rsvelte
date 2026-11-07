import * as $ from 'svelte/internal/server';
import Parent from './Parent.svelte';
import Child from './Child.svelte';

export default function Main($$renderer) {
	Parent($$renderer, {
		$$slots: {
			item: ($$renderer, { item }) => {
				Child($$renderer, {
					slot: 'item',
					onclick: () => console.log(item),
					children: ($$renderer) => {
						$$renderer.push(`<!---->asd`);
					},
					$$slots: { default: true }
				});
			}
		}
	});
}