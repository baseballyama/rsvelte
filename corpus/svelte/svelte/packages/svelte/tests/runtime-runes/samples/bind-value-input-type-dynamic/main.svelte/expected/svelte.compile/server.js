import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let dynamic = 'x';
	let spread = 'y';
	let inputType = 'text';
	let props = $.derived(() => ({ type: inputType }));

	$$renderer.push(`<input${$.attr('value', dynamic)}${$.attr('type', inputType)}/> <input${$.attributes({ value: spread, ...props() }, void 0, void 0, void 0, 4)}/> <p>${$.escape(dynamic)} / ${$.escape(spread)}</p> <button>change to text</button> <button>change to number</button> <button>change to range</button>`);
}