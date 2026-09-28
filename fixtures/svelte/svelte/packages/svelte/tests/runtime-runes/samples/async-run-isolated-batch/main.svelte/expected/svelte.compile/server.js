import * as $ from 'svelte/internal/server';
import Child from "./Child.svelte";

const queued = [];

export function push(v) {
	return new Promise((fulfil) => {
		queued.push(() => fulfil(v));
	});
}

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let show = false;
		let count = 0;

		if (show) {
			$$renderer.push('<!--[0-->');
			Child($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button>show</button> <button>resolve</button> <button>${$.escape(count)}</button>`);
	});
}