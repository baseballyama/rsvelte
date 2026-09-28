import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;
	let value = { value: "" };
	let checked = { checked: false };

	$$renderer.push(`<input${$.attributes({ type: 'text', ...value }, void 0, void 0, void 0, 4)}/> <textarea${$.attributes({ ...value })}></textarea> <input${$.attributes({ type: 'checkbox', ...checked }, void 0, void 0, void 0, 4)}/> <button>${$.escape(count)}</button>`);
}