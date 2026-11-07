import * as $ from 'svelte/internal/server';
import { BROWSER } from 'esm-env';

export default function Env02_input($$renderer) {
	if (BROWSER) {
		const a = window.localStorage.getItem('myCat');

		console.log(a);
	}
}