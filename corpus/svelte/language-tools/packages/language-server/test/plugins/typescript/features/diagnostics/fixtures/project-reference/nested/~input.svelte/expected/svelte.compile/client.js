import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { hi } from 'hi2';

export default function Input($$anchor, $$props) {
	$.push($$props, true);
	hi((num) => num.toString());

	// project reference redirect skip check so put an error here
	let a = 'a';

	a;
	$.pop();
}