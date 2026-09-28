import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = $.derived(() => 0);
	let postfix = $.update_derived(count);
	let postfix_minus = $.update_derived(count, -1);
	let prefix = $.update_derived_pre(count);
	let prefix_minus = $.update_derived_pre(count, -1);
	let count_n = $.derived(() => 0n);
	let postfix_n = $.update_derived(count_n);
	let postfix_minus_n = $.update_derived(count_n, -1);
	let prefix_n = $.update_derived_pre(count_n);
	let prefix_minus_n = $.update_derived_pre(count_n, -1);

	$$renderer.push(`<p>postfix: ${$.escape(postfix)}, postfix_minus: ${$.escape(postfix_minus)}, prefix: ${$.escape(prefix)}, prefix_minus: ${$.escape(prefix_minus)}, count: ${$.escape(count())}</p> <p>postfix_n: ${$.escape(postfix_n)}, postfix_minus_n: ${$.escape(postfix_minus_n)}, prefix_n: ${$.escape(prefix_n)}, prefix_minus_n: ${$.escape(prefix_minus_n)}, count_n: ${$.escape(count_n())}</p>`);
}