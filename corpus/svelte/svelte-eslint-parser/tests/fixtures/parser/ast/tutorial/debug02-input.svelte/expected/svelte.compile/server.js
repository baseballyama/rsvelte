import * as $ from 'svelte/internal/server';

export default function Debug02_input($$renderer) {
	let user = { firstname: 'Ada', lastname: 'Lovelace' };

	console.log({ user, foo });

	debugger;

	$$renderer.push(`<input${$.attr('value', user.firstname)}/> <input${$.attr('value', user.lastname)}/> <h1>Hello ${$.escape(user.firstname)}!</h1>`);
}