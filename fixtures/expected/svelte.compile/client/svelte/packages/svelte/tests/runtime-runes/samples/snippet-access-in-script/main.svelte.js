import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fn } from "./fn.js";

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const test = ($$anchor) => {
		$.next();

		var text = $.text();

		text.nodeValue = 'var';
		$.append($$anchor, text);
	};

	let variable = "var";

	fn(test);
	$.pop();
}