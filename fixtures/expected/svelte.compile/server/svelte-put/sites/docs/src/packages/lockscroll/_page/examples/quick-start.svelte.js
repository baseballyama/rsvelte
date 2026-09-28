import * as $ from 'svelte/internal/server';
import { lockscroll } from '@svelte-put/lockscroll';

export default function Quick_start($$renderer) {
	let locked = false;

	function toggleLockScroll() {
		locked = !locked;
	}

	$$renderer.push(`<button class="c-btn mx-auto">Toggle lock scroll on body</button>`);
}