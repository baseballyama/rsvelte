import * as $ from 'svelte/internal/server';
import { page } from "$app/state";

export default function KenerFooter($$renderer) {
	let { data } = page;

	$$renderer.push(`<div class="mx-auto flex max-w-5xl justify-center px-4">${$.html(data.footerHTML)}</div>`);
}