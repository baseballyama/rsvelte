import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';

export default function Env01_input($$renderer) {
	if (browser) {
		const a = window.localStorage.getItem('myCat');

		console.log(a);
	}
}