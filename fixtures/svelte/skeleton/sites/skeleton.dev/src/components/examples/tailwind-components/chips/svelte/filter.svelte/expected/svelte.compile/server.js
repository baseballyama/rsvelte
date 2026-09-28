import * as $ from 'svelte/internal/server';
import CheckIcon from '@lucide/svelte/icons/check';

export default function Filter($$renderer) {
	const colors = ['red', 'green', 'blue'];
	let color = colors[0];

	function setColor(selectedColor) {
		color = selectedColor;
	}

	$$renderer.push(`<div class="card preset-filled-surface-100-900 w-full max-w-md p-4"><div class="flex justify-center items-center gap-2"><span class="text-sm opacity-60">Favorite Color</span> <!--[-->`);

	const each_array = $.ensure_array_like(colors);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let c = each_array[$$index];

		$$renderer.push(`<button${$.attr_class(`chip capitalize preset-outlined-surface-400-600 ${color === c ? 'preset-tonal-primary' : ''}`)}>`);

		if (color === c) {
			$$renderer.push('<!--[0-->');
			CheckIcon($$renderer, { size: 14 });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span>${$.escape(c)}</span></button>`);
	}

	$$renderer.push(`<!--]--></div></div>`);
}