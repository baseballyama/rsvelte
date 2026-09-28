import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let checked = true;
	let count = 0;

	const onclick = $.derived(() => checked
		? () => {
			count++;
		}
		: undefined);

	$$renderer.push(`<p>${$.escape(count)}</p> <input type="checkbox"${$.attr('checked', checked, true)}/> <button${$.attributes({ ...{ onclick: onclick() } })}></button>`);
}