import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { derived } from 'svelte/store';

var root = $.from_html(`<h1></h1>`);

export default function Main($$anchor) {
	let state = 'state';
	let derived_state = $.derived(() => state + '2');
	var h1 = root();

	h1.textContent = `Hello state ${$.get(derived_state) ?? ''}`;
	$.append($$anchor, h1);
}