import * as $ from 'svelte/internal/server';

export default function Spread_input($$renderer, $$props) {
	let { $$slots, $$events, ...attrs } = $$props;
	let text = '';
	let checked = false;
	$$renderer.push(`<input${$.attributes({ ...attrs }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ ...attrs, value: text }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ type: 'checkbox', ...attrs, checked }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ ...attrs, value: text, defaultvalue: 'seed' }, void 0, void 0, void 0, 4)}/> <p>${$.escape(text)} ${$.escape(checked)}</p>`);
}
