import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'a', 'b', 'c']);

export default function Ts_$props01_type_output($$anchor, $$props) {
	// MyProps: MyProps
	// a: number
	// b: string
	// c: boolean
	// d: number
	let everythingElse = $.rest_props($$props, rest_excludes); // a: number, a: number, b: string, b: string, c: boolean, c: boolean, everythingElse: { d: number; }, MyProps: MyProps, $props(): MyProps

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${$$props.a ?? ''} ${$$props.b ?? ''} ${$$props.c ?? ''} ${everythingElse ?? ''}`));
	$.append($$anchor, text);
}