import * as $ from 'svelte/internal/server';

export default function Non_bind_this01_input($$renderer) {
	let foo;
	let bar;

	const remove = () => {
		foo.remove();
		bar.remove();
	};

	$$renderer.push(`<input${$.attr('value', foo)}/> <button>Click Me</button>`);
}