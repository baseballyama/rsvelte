import * as $ from 'svelte/internal/server';

function blastoff($$renderer) {
	$$renderer.push(`<span>🚀</span>`);
}

function countdown($$renderer, n) {
	if (n > 0) {
		$$renderer.push(`<!--[0--><span>${$.escape(n)}...</span> `);
		countdown($$renderer, n - 1);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
		blastoff($$renderer);
	}

	$$renderer.push(`<!--]-->`);
}

export default function _5_snippet_scope_input($$renderer) {
	countdown($$renderer, 10);
}