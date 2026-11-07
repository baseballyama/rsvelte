import * as $ from 'svelte/internal/server';

export default function _2_input($$renderer) {
	let user = { firstname: 'Ada', lastname: 'Lovelace' };

	console.log({ user });

	debugger;

	$$renderer.push(`<h1>Hello ${$.escape(user.firstname)}!</h1>`);
}