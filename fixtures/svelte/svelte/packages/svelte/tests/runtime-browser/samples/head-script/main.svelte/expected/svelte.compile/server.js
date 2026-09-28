import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$.head('wgt45c', $$renderer, ($$renderer) => {
		$$renderer.push(`<script>
		// A comment
		const val = 'Hello world';
		document.addEventListener('DOMContentLoaded', () => {
			document.querySelector('button').textContent = val;
		});
	</script>`);

		$$renderer.push(`<!---->`);
	});

	$$renderer.push(`<button>click me</button>`);
}