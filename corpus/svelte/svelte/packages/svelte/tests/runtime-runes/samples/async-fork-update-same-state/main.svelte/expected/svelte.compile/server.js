import * as $ from 'svelte/internal/server';
import { fork } from "svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let state = 0;
		let count = $.derived(() => state);
		let forked;

		$$renderer.push(`<button>fork 1</button> <button>fork 2</button> <button>commit</button> <p>${$.escape(count())}</p>`);
	});
}