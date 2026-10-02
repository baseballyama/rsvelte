import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let text = { defaultValue: "a" };
	let checkbox = { defaultChecked: true };

	$$renderer.push(`<input${$.attributes({ ...text }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ type: 'checkbox', ...checkbox }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ value: 'b', ...text }, void 0, void 0, void 0, 4)}/>`);
}