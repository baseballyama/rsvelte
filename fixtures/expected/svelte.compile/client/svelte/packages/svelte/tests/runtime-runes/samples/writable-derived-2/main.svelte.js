import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { expect2, createAppState } from "./util.svelte.js";

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const result = createAppState({ source: () => "wrong" });

	result.onChange("right");

	const expect1 = result.value === "right";

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${expect1} ${expect2 ?? ''}`));
	$.append($$anchor, text);
	$.pop();
}