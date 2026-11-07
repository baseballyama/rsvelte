import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Writable, Readable } from 'svelte/store';

export default function Ts_store03_type_output($$anchor, $$props) {
	$.push($$props, true);

	const $maybeUndef = () => $.store_get(maybeUndef, '$maybeUndef', $$stores);
	const $maybeNull = () => $.store_get(maybeNull, '$maybeNull', $$stores);
	const $maybeNullAndStr = () => $.store_get(maybeNullAndStr, '$maybeNullAndStr', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// Writable: any, Writable: any, Readable: any, Readable: any
	let maybeUndef; // maybeUndef: Writable<number> | undefined

	let maybeNull; // maybeNull: Readable<string> | null
	let maybeNullAndStr; // maybeNullAndStr: string | Readable<boolean> | null

	function fn() {
		// fn: () => void
		$maybeUndef(); // $maybeUndef: number | undefined

		$maybeNull(); // $maybeNull: string | null
		$maybeNullAndStr(); // $maybeNullAndStr: string | boolean | null
	}

	var $$exports = { fn };

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${$maybeUndef() ?? ''} ${$maybeNull() ?? ''} ${$maybeNullAndStr() ?? ''}`));
	$.append($$anchor, text);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}