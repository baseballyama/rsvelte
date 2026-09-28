import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	const test = { placeholder: 'Text' };

	$$renderer.push(`<input${$.attributes({ ...test }, 'svelte-10t85l6', void 0, void 0, 4)}/> <div class="svelte-10t85l6">Should be red, when input is focused</div>`);
}