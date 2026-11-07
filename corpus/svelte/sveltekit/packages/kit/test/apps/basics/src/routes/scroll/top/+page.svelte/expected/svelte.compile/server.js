import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<div style="width:100%; height: 200vh; background-color: goldenrod"></div> <p><a href="#">#</a></p> <p><a href="#top">#top</a></p>`);
}