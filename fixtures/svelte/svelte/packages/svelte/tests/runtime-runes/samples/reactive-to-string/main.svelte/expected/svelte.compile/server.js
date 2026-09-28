import * as $ from 'svelte/internal/server';
import { SvelteSet, SvelteMap } from 'svelte/reactivity';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let map = new Map();
		let set = new Set();
		let rmap = new SvelteMap();
		let rset = new SvelteSet();

		$$renderer.push(`<div>${$.escape(rset.entries())} ${$.escape(rset.keys())} ${$.escape(rset.values())}</div> <div>${$.escape(set.entries())} ${$.escape(set.keys())} ${$.escape(set.values())}</div> <div>${$.escape(rmap.entries())} ${$.escape(rmap.keys())} ${$.escape(rmap.values())}</div> <div>${$.escape(map.entries())} ${$.escape(map.keys())} ${$.escape(map.values())}</div>`);
	});
}