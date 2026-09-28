import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let visible = true;

	$$renderer.push(`<button>hide</button> `);

	if (visible) {
		$$renderer.push(`<!--[0--><script>
		document.body.querySelector('.after').innerHTML = 'this should be executed';
	</script>`);

		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <div class="after">after</div>`);
}