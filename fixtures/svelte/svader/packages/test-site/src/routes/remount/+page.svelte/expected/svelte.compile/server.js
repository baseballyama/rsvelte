import * as $ from 'svelte/internal/server';
import { resolve } from "$app/paths";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<ul><li><a${$.attr('href', resolve("/remount/webgl"))}>WebGL</a></li> <li><a${$.attr('href', resolve("/remount/webgpu"))}>WebGPU</a></li></ul>`);
	});
}