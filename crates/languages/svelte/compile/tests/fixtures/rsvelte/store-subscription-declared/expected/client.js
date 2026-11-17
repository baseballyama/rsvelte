import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { writable } from "svelte/store";
export default function Store_subscription_declared($$anchor, $$props) {
	$.push($$props, true);
	const $a = () => $.store_get(a, "$a", $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const a = writable(0);
	$.next();
	var text = $.text();
	$.template_effect(() => $.set_text(text, $a()));
	$.append($$anchor, text);
	$.pop();
	$$cleanup();
}
