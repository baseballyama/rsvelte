import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<p>this &lt;em>should&lt;/em> not be <span>&lt;strong>bold&lt;/strong></span></p>`);
}