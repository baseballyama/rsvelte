import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<p>This app exists to assert that an app with only prerendered routes successfully renders custom
	error pages.</p>`);
}