import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';

export default function Modal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();
		const destroy = () => dispatch('destroy');

		$$renderer.push(`<div class="modal-background"></div> <div class="modal"><!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]--> <button>close modal</button></div>`);
	});
}