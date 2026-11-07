import * as $ from 'svelte/internal/server';
import Inner from "./inner.svelte";

export default function Main($$renderer) {
	let testProps = { color: "red" };

	$$renderer.push(`<button>set color</button> <button>set options</button> `);
	Inner($$renderer, $.spread_props([testProps]));
	$$renderer.push(`<!----> `);
	Inner($$renderer, { color: testProps.color });
	$$renderer.push(`<!---->`);
}