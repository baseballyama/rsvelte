import * as $ from 'svelte/internal/server';

export default function _3_input($$renderer) {
	if (visible) {
		$$renderer.push(`<!--[0--><div>flies in, fades out over two seconds</div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}