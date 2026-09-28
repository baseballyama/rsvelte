import * as $ from 'svelte/internal/server';
import { derived } from 'svelte/store';

export default function Main($$renderer) {
	let state = 'state';
	let derived_state = $.derived(() => state + '2');

	$$renderer.push(`<h1>Hello state state2</h1>`);
}