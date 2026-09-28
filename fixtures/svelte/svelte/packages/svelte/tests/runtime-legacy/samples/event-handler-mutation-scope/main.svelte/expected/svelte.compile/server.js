import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let referenced_directly = 0;
	let not_referenced_directly = 0;
	let css_based_on_not_referenced = '';

	function click() {
		referenced_directly += 1;
		not_referenced_directly += 1;
		css_based_on_not_referenced = not_referenced_directly % 2 == 1 ? 'background-color: red' : '';
		console.log(referenced_directly + ' - ' + not_referenced_directly); //only referenced_directly is increasing
	}

	$$renderer.push(`<button${$.attr_style(css_based_on_not_referenced)}>increase both</button> ${$.escape(referenced_directly)}`);
}