import * as $ from 'svelte/internal/server';
import { lockscroll } from '@svelte-put/lockscroll';

export default function Svelte_rune($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class ScrollLock {
			locked = false;

			toggle(force = !this.locked) {
				this.locked = force;
			}
		}

		const lock = new ScrollLock();

		$$renderer.push(`<div class="flex justify-center gap-4"><button class="c-btn">Toggle lock scroll</button> <button class="c-btn c-btn--outlined">Force locked</button> <button class="c-btn c-btn--outlined">Force unlocked</button></div>`);
	});
}