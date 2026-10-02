import * as $ from 'svelte/internal/server';
import Ripple from '@smui/ripple';

export default function _KeyboardActivation($$renderer) {
	let active = false;

	$$renderer.push(`<div tabindex="0" role="button" class="svelte-180xget">Keyboard activation on an arbitrary element. (Focus and press space/enter.)</div>`);
}