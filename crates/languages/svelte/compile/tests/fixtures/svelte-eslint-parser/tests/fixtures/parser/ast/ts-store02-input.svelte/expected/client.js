import 'svelte/internal/disclose-version';
import { writable } from 'svelte/store';
import * as $ from 'svelte/internal/client';

const a = writable(0);

export default function Ts_store02_input($$anchor, $$props) {
	$.push($$props, true);

	const $a = () => $.store_get(a, '$a', $$stores);
	const $b = () => $.store_get(b, '$b', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const b = writable(0);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${$a() ?? ''}
${$b() ?? ''}`));

	$.append($$anchor, text);
	$.pop();
	$$cleanup();
}