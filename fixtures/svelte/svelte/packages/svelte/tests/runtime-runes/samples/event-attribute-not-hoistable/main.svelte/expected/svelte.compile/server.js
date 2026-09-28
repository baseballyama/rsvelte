import * as $ from 'svelte/internal/server';

function declared_in_module_scope() {
	return 'x';
}

let a = declared_in_module_scope();
let b = 'x';

try {
	b = doesnt_exist();
} catch(e) {
	b = 'y';
}

export default function Main($$renderer) {
	let count1 = 0;
	let count2 = 0;
	let count3 = 0;

	function increment() {
		count1 += 1;
	}

	function declared_in_module_scope() {
		count2 += 1;
	}

	function doesnt_exist() {
		count3 += 1;
	}

	$$renderer.push(`<button>${$.escape(count1)}</button> <button>${$.escape(a)}${$.escape(count2)}</button> <button>${$.escape(b)}${$.escape(count3)}</button>`);
}