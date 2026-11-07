import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Date } from "package";

export default function Unrelated_date01_input($$anchor, $$props) {
	$.push($$props, true);

	const variable = new Date(8.64e15);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, variable));
	$.append($$anchor, text);
	$.pop();
}