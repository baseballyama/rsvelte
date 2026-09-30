import * as $ from 'svelte/internal/server';

export default function Attrs_svue($$renderer) {
	let value = '';
	let active = false;

	function onInput(event) {
		value = event.target.value;
	}

	$$renderer.push(`<label for="name"${$.attr('data-state', active ? 'on' : 'off')}>Name &lt;required></label> <input id="name" required=""${$.attr('value', value)}/> <p${$.attr('data-length', value.length)} hidden="">${$.escape(value)}</p>`);
}