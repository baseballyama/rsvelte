import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	SomeComponent($$renderer, { relaxed: true });
	$$renderer.push(`<!----> <input disabled=""/> <div popover=""></div>`);
}