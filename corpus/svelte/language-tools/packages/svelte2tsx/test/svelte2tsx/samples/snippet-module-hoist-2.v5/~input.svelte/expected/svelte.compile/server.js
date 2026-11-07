import * as $ from 'svelte/internal/server';
import { imported } from './x';

function hoistable($$renderer) {
	$$renderer.push(`<div>hello</div>`);
}

export default function Input($$renderer) {
	let foo = true;

	function not_hoistable($$renderer) {
		$$renderer.push(`<div>true</div>`);
	}
}