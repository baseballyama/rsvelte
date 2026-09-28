import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<form target="_blank"><button>Inside form</button></form> <form id="my-form"></form> <button formtarget="_blank" form="my-form">Outside form</button>`);
}