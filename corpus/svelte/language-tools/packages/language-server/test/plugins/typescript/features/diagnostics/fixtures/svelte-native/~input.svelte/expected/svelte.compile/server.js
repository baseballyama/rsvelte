import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let message = "Blank Svelte Native App";

	$$renderer.push(`<page><label class="info" horizontalalignment="center" verticalalignment="center" textwrap="true"><formattedstring><span class="fas" text=""></span> <span text=" Blank Svelte Native App"></span></formattedstring></label> <div asd=""></div></page>`);
}