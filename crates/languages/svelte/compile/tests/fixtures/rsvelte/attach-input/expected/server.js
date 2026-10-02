import * as $ from 'svelte/internal/server';

export default function Attach_input($$renderer) {
	let text = '';
	let focused = false;
	function autofocus(node) {
		node.focus();
	}
	$$renderer.push(`<label>Name <input${$.attr('value', text)}/></label> <p>${$.escape(focused ? 'typing' : 'idle')}</p>`);
}
