import * as $ from 'svelte/internal/server';
import Wrapper1 from "./wrapper.svelte";
import Wrapper2 from "./wrapper2.svelte";

export default function Main($$renderer) {
	let count = 0;

	let getter = $.derived(() => {
		const copy = count;

		return () => copy;
	});

	$$renderer.push(`<button>inc</button> `);
	Wrapper1($$renderer, { getter: getter() });
	$$renderer.push(`<!----> `);
	Wrapper2($$renderer, { getter: getter() });
	$$renderer.push(`<!---->`);
}