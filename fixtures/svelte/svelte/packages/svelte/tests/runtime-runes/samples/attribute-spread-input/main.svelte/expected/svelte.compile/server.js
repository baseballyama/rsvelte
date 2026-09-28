import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = void 0;
	let checked = false;

	function setValues() {
		value = 'message';
		checked = true;
	}

	function clearValues() {
		value = null;
		checked = null;
	}

	$$renderer.push(`<button>setValues</button> <button>clearValues</button> <input type="text"${$.attr('value', value)}/> <input${$.attributes({ type: 'text', value, ...{} }, void 0, void 0, void 0, 4)}/> <input type="checkbox"${$.attr('checked', checked, true)}/> <input${$.attributes({ type: 'checkbox', checked, ...{} }, void 0, void 0, void 0, 4)}/>`);
}