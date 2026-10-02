import * as $ from 'svelte/internal/server';
import Comp_1 from './Comp-1.svelte';
import Comp_2 from './Comp-2.svelte';

export default function Main($$renderer) {
	let Comp = Comp_1;
	let data = { obj: { arr: [1, 2, 3] } };

	function change() {
		Comp = Comp_2;
		data = {};
	}

	$$renderer.push(`<button>Change</button> `);

	if (Comp) {
		$$renderer.push('<!--[-->');
		Comp($$renderer, { data });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}