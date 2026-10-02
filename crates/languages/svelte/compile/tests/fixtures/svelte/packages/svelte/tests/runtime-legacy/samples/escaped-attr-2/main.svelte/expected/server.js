import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const x = `</noscript><script>console.log('should not run')<` + `/script>`;

	$$renderer.push(`<noscript><a${$.attr('href', x)}>test</a></noscript>`);
}