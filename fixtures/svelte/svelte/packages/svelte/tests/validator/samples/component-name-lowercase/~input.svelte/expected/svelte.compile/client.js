import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import thisShouldWarnMe from './MyComponent.svelte';
import { form } from './form';

var root = $.from_html(`<thisshouldwarnme></thisshouldwarnme> <i></i> <form></form>`, 1);

export default function Input($$anchor) {
	let i;

	form;

	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}