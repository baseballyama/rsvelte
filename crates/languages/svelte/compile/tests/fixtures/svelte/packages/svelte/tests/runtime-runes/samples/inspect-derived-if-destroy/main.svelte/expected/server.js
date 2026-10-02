import * as $ from 'svelte/internal/server';
import List from "./List.svelte";

export default function Main($$renderer) {
	let data = { things: [{ id: 1 }, { id: 2 }] };

	function reloadData() {
		data = null;
	}

	if (data) {
		$$renderer.push('<!--[0-->');
		List($$renderer, { things: data.things.map((t) => t) });
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <button>clear</button>`);
}