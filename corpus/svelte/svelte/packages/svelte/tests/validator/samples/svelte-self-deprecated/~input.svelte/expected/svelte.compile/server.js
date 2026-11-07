import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	let { n = 5 } = $$props;

	if (n === 0) {
		$$renderer.push(`<!--[0--><p>lift-off!</p>`);
	} else {
		$$renderer.push(`<!--[-1--><p>${$.escape(n)}</p> `);
		Input($$renderer, { n: n - 1 });
		$$renderer.push(`<!---->`);
	}

	$$renderer.push(`<!--]-->`);
}