import 'svelte/internal/disclose-version';
import { writable } from 'svelte/store';
import * as $ from 'svelte/internal/client';

const a = writable(0);

export default function Ts_store02_type_output($$anchor, $$props) {
	$.push($$props, true);

	const $a = () => $.store_get(a, '$a', $$stores);
	const $b = () => $.store_get(b, '$b', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const b = writable(0); // b: Writable<number>, writable(0): Writable<number>

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${// $b: string
	$a() ?? ''} ${$b() ?? ''}`));

	$.append($$anchor, text);
	$.pop();
	$$cleanup();
}