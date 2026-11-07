import * as $ from 'svelte/internal/server';
import { createAttachmentKey } from 'svelte/attachments';
import Child from './Child.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let stuff = {
			[createAttachmentKey()]: (node) => {
				console.log(`one ${node.nodeName}`);

				return () => {
					console.log('cleanup one');
				};
			}
		};

		function update() {
			stuff = {
				[createAttachmentKey()]: (node) => {
					console.log(`two ${node.nodeName}`);

					return () => {
						console.log('cleanup two');
					};
				}
			};
		}

		$$renderer.push(`<button>update</button> `);
		Child($$renderer, $.spread_props([stuff]));
		$$renderer.push(`<!---->`);
	});
}