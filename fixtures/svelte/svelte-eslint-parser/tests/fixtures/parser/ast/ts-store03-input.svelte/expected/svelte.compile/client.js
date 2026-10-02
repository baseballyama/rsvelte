import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Writable, Readable } from 'svelte/store';

export default function Ts_store03_input($$anchor, $$props) {
	$.push($$props, true);

	const $maybeUndef = () => $.store_get(maybeUndef, '$maybeUndef', $$stores);
	const $maybeNull = () => $.store_get(maybeNull, '$maybeNull', $$stores);
	const $maybeNullAndStr = () => $.store_get(maybeNullAndStr, '$maybeNullAndStr', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let maybeUndef;
	let maybeNull;
	let maybeNullAndStr;

	function fn() {
		$maybeUndef();
		$maybeNull();
		$maybeNullAndStr();
	}

	var $$exports = { fn };

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${$maybeUndef() ?? ''}
${$maybeNull() ?? ''}
${$maybeNullAndStr() ?? ''}`));

	$.append($$anchor, text);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}