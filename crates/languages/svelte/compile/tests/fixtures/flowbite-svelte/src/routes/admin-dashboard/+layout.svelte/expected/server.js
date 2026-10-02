import * as $ from 'svelte/internal/server';
import modeobserver from "./utils/modeobserver";
import { onMount } from "svelte";

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, data } = $$props;

		onMount(modeobserver);
		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}