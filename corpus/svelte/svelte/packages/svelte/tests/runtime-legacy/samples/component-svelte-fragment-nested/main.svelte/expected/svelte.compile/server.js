import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	Child($$renderer, {
		children: ($$renderer) => {
			{
				$$renderer.push(`Default`);
			}
		},

		$$slots: {
			default: true,
			b: ($$renderer) => {
				{
					$$renderer.push(`<p>B slot</p>`);
				}
			}
		}
	});
}