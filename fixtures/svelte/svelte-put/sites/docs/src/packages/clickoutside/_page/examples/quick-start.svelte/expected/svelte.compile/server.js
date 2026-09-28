import * as $ from 'svelte/internal/server';
import { clickoutside } from '@svelte-put/clickoutside';

export default function Quick_start($$renderer) {
	function doSomething(e) {
		console.log(e.target);
	}

	$$renderer.push(`<div>...</div>`);
}