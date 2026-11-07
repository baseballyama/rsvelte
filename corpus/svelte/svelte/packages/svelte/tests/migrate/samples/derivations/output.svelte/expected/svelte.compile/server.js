import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	let count = 0;

	// semicolon at the end
	let doubled = $.derived(() => count * 2);

	let $$d = $.derived(() => ({ quadrupled: count * 4 })),
		quadrupled = $.derived(() => $$d().quadrupled);

	// no semicolon at the end
	let time_8 = $.derived(() => count * 8);

	let $$d_1 = $.derived(() => ({ time_16: count * 16 })),
		time_16 = $.derived(() => $$d_1().time_16);

	// preceding let that doesn't do anything
	let time_32 = $.derived(() => count * doubled());

	let very_high = $.derived(() => time_32() * count);

	$$renderer.push(`<!---->0 / 0 / ${$.escape(quadrupled())} / 0 / ${$.escape(time_16())}`);
}