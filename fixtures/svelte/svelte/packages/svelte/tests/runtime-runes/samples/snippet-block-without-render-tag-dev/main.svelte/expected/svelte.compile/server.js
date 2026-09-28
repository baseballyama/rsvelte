import * as $ from 'svelte/internal/server';

function testSnippet($$renderer) {
	$$renderer.push(`<p>hi again</p>`);
}

export default function Main($$renderer) {
	$$renderer.push(`<!---->${$.escape(testSnippet)}`);
}