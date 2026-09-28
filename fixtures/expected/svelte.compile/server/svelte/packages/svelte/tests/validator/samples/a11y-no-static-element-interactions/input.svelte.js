import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	const dynamicRole = "button";

	$$renderer.push(`<button>click me</button> <div role="button"></div> <input type="text"/> <div></div> <a href="/foo">link</a> <div${$.attr('role', dynamicRole)}></div> <footer></footer> <div></div> <a>link</a> <div></div> <div></div> <div></div>`);
}