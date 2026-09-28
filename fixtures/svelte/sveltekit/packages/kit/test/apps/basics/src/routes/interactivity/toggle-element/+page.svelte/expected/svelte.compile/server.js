import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	let visible = true;

	function toggle() {
		visible = !visible;
	}

	if (visible) {
		$$renderer.push(`<!--[0--><button>remove</button> <a>remove</a>`);
	} else {
		$$renderer.push(`<!--[-1--><button>add</button> <a>add</a>`);
	}

	$$renderer.push(`<!--]-->`);
}