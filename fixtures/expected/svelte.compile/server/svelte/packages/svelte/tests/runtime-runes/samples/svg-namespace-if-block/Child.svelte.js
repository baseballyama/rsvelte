import * as $ from 'svelte/internal/server';

export default function Child($$renderer) {
	if (true) {
		$$renderer.push(`<!--[0--><g><rect x="20" y="10" width="50" height="50" fill="yellow"></rect></g>`);
	} else {
		$$renderer.push(`<!--[-1--><div>lol</div>`);
	}

	$$renderer.push(`<!--]-->`);
}