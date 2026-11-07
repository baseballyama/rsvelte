import * as $ from 'svelte/internal/server';

function hoistable($$renderer) {
	$$renderer.push(`<h1>hoist me</h1>`);
}

export default function Input($$renderer) {
	let foo = true;

	function chain($$renderer) {
		$$renderer.push(`<div>true</div>`);
	}

	function chain2($$renderer) {
		chain($$renderer);
	}

	function chain3($$renderer) {
		chain2($$renderer);
	}
}