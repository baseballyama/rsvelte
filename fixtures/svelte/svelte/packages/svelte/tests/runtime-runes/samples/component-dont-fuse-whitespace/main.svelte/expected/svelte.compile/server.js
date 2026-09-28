import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let text = 'dont fuse this text with the one from the child';

	Child($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->dont fuse this text with the one from the child`);
		},
		$$slots: { default: true }
	});
}