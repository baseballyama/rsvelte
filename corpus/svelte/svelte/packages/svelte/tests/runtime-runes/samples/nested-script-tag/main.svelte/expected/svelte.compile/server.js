import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div>`);

	$$renderer.push(`<script>
		console.log('init');
	</script>`);

	$$renderer.push(`<!----></div>`);
}