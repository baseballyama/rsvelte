import * as $ from 'svelte/internal/server';

export default function Svelte_window_bindings_input($$renderer) {
	const layers = [0, 1, 2, 3, 4, 5, 6, 7, 8];
	let y;

	$$renderer.push(`<a class="parallax-container svelte-1a4we9h" href="https://www.firewatchgame.com"><!--[-->`);

	const each_array = $.ensure_array_like(layers);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let layer = each_array[$$index];

		$$renderer.push(`<img${$.attr_style(`transform: translate(0,${$.stringify(-y * layer / (layers.length - 1))}px)`)}${$.attr('src', `https://www.firewatchgame.com/images/parallax/parallax${$.stringify(layer)}.png`)}${$.attr('alt', `parallax layer ${$.stringify(layer)}`)} class="svelte-1a4we9h"/>`);
	}

	$$renderer.push(`<!--]--></a> <div class="text svelte-1a4we9h"><span${$.attr_style(`opacity: ${$.stringify(1 - Math.max(0, y / 40))}`)} class="svelte-1a4we9h">scroll down</span> <div class="foreground svelte-1a4we9h">You have scrolled ${$.escape(y)} pixels</div></div>`);
}