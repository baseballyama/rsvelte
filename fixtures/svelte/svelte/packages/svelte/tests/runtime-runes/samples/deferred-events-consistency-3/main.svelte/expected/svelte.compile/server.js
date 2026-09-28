import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let toggle = false;

	const onclick = $.derived(() => toggle
		? () => {
			console.log('works');
		}
		: () => {
			console.log('fails');
		});

	const props = $.derived(() => ({ onclick: onclick() }));

	$$renderer.push(`<div${$.attributes({ ...props() })}><button>click me</button></div>`);
}