import * as $ from 'svelte/internal/server';
import Wrapper from "./Wrapper.svelte";

export default function Main($$renderer) {
	$$renderer.push(`<svg>`);
	Wrapper($$renderer, {});
	$$renderer.push(`<!----></svg>`);
}