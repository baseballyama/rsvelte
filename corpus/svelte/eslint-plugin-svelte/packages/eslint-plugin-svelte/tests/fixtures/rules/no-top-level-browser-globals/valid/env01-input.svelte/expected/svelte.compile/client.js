import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';

export default function Env01_input($$anchor) {
	if (browser) {
		const a = window.localStorage.getItem('myCat');

		console.log(a);
	}
}