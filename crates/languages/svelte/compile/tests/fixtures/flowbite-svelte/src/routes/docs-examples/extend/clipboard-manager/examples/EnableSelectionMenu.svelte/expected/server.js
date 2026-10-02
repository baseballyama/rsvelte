import * as $ from 'svelte/internal/server';
import { ClipboardManager } from "flowbite-svelte";

export default function EnableSelectionMenu($$renderer) {
	ClipboardManager($$renderer, { enableSelectionMenu: true });
	$$renderer.push(`<!----> <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>`);
}