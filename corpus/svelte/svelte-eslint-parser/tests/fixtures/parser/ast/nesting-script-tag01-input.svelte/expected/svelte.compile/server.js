import * as $ from 'svelte/internal/server';

export default function Nesting_script_tag01_input($$renderer) {
	$$renderer.push(`<div>`);

	$$renderer.push(`<script>
		let a;
	</script>`);

	$$renderer.push(`<!----></div>`);
}