import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BROWSER } from 'esm-env';

export default function Env02_input($$anchor) {
	if (BROWSER) {
		const a = window.localStorage.getItem('myCat');

		console.log(a);
	}
}