import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from "svelte/store";

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $x = () => $.store_get(x, '$x', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let x = writable(0);
	const a = $.update_store(x, $x());
	const b = $.update_pre_store(x, $x());
	const c = $.update_store(x, $x(), -1);
	const d = $.update_pre_store(x, $x(), -1);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${$x() ?? ''} ${a ?? ''} ${b ?? ''} ${c ?? ''} ${d ?? ''}`));
	$.append($$anchor, text);
	$.pop();
	$$cleanup();
}