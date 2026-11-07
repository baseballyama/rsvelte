import * as $ from 'svelte/internal/server';

export default function Ts_$props01_type_output($$renderer, $$props) {
	// MyProps: MyProps
	// a: number
	// b: string
	// c: boolean
	// d: number
	let {
		a,
		b,
		c, // a: number, a: number, b: string, b: string, c: boolean, c: boolean, everythingElse: { d: number; }, MyProps: MyProps, $props(): MyProps
		$$slots,
		$$events,
		...everythingElse
	} = $$props;

	$$renderer.push(`<!---->${$.escape(a)} ${$.escape(b)} ${$.escape(c)} ${$.escape(everythingElse)}`);
}