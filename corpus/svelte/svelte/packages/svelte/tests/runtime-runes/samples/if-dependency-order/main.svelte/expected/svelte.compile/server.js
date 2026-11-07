import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let data = { num: 1 };

	function expire() {
		data.num = data.num - 1;

		if (data.num <= 0) data = undefined;
	}

	if (data) {
		$$renderer.push(`<!--[0--><button>Click</button> <p>expires in ${$.escape(data.num)} click</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}