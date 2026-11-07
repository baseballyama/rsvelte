import * as $ from 'svelte/internal/server';

export default function Debug01_input($$renderer) {
	let user = { firstname: 'Ada', lastname: 'Lovelace' };

	console.log({});

	debugger;

	$$renderer.push(`<input${$.attr('value', user.firstname)}/> <input${$.attr('value', user.lastname)}/> <h1>Hello ${$.escape(user.firstname)}!</h1>`);
}