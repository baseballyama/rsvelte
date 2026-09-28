import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<noscript><a href="&lt;/noscript>&lt;script>console.log('should not run')&lt;/script>">test</a></noscript>`);
}