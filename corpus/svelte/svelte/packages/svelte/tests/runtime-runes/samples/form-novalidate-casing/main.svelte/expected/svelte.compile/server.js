import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let noValidate = true;

	$$renderer.push(`<form${$.attr('novalidate', true, true)}></form> <form${$.attr('novalidate', noValidate, true)}></form>`);
}