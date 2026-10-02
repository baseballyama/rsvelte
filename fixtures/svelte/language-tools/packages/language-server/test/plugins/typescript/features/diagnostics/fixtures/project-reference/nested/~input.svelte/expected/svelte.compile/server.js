import * as $ from 'svelte/internal/server';
import { hi } from 'hi2';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		hi((num) => num.toString());

		// project reference redirect skip check so put an error here
		let a = 'a';

		a;
	});
}