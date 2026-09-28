import * as $ from 'svelte/internal/server';
import { fade } from "svelte/transition";

export default function ModalArea($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<div class="wx-modal svelte-6x8wgo"><div class="wx-window svelte-6x8wgo">`);
	children?.($$renderer);
	$$renderer.push(`<!----></div></div>`);
}