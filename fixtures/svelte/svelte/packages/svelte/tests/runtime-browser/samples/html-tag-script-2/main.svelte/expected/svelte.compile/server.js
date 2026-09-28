import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div>`);
	$$renderer.push(`<script></script>`);
	$$renderer.push(`<!----></div> ${$.html(`<script>document.body.innerHTML = 'this should not be executed'</script>`)} `);

	if (true) {
		$$renderer.push(`<!--[0--><script></script>`);
		$$renderer.push(`${$.html(`<script>document.body.innerHTML = 'this neither'</script>`)}`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}