import * as $ from 'svelte/internal/server';

export default function Module_script_input($$renderer, $$props) {
	let { name, age } = $$props;

	console.log(name, age);
}