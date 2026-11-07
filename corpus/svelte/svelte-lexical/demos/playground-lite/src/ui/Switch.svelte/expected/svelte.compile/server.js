import * as $ from 'svelte/internal/server';

export default function Switch($$renderer, $$props) {
	let { checked, text, onclick, id = undefined } = $$props;
	const buttonId = 'id_' + Math.floor(Math.random() * 10000);

	$$renderer.push(`<div class="switch svelte-43el62"${$.attr('id', id)}><label${$.attr('for', buttonId)} class="svelte-43el62">${$.escape(text)}</label> <button role="switch"${$.attr('aria-checked', checked ? 'true' : 'false')}${$.attr('aria-label', text)}${$.attr('id', buttonId)} class="svelte-43el62"><span class="svelte-43el62"></span></button></div>`);
}