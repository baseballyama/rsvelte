import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<p><span>1</span> `);

	if (true) {
		$$renderer.push(`<!--[0--><code>2</code>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></p>`);
}