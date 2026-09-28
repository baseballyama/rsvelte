import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<iframe title="Child content" src="./child"></iframe>`);
}