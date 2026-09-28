import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let spread = { defaultChecked: true, checked: true };

	$$renderer.push(`<form><input${$.attributes({ type: 'radio', name: 'option', value: 'a', ...spread }, void 0, void 0, void 0, 4)}/> <input type="radio" name="option" value="b"/> <input type="reset" value="Reset"/></form>`);
}