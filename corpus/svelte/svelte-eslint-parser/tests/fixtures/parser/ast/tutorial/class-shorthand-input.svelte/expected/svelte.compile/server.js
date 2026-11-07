import * as $ from 'svelte/internal/server';

export default function Class_shorthand_input($$renderer) {
	let big = false;

	$$renderer.push(`<label><input type="checkbox"${$.attr('checked', big, true)}/> big</label> <div${$.attr_class('svelte-1fg3cps', void 0, { 'big': big })}>some ${$.escape(big ? 'big' : 'small')} text</div>`);
}