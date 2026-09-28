import * as $ from 'svelte/internal/server';
import Child from "./Child.svelte";

export default function Main($$renderer) {
	$$renderer.push(`<svg viewBox="0 0 100 100" width="200px" height="200px">`);
	Child($$renderer, {});
	$$renderer.push(`<!----></svg>`);
}