import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const content = `<b style='color: red;'>RED?!?</b>`;

	$$renderer.push(`<p>&lt;b style='color: red;'>RED?!?&lt;/b></p>`);
}