import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	let count = (void 0, 0);

	// semicolon at the end
	let doubled = $.derived(() => (void 0, count * 2));

	let $$d = $.derived(() => (void 0, { quadrupled: count * 4 })),
		quadrupled = $.derived(() => $$d().quadrupled);

	// no semicolon at the end
	let time_8 = $.derived(() => (void 0, count * 8));

	let $$d_1 = $.derived(() => (void 0, { time_16: count * 16 })),
		time_16 = $.derived(() => $$d_1().time_16);

	$$renderer.push(`<button></button> ${$.escape(count)} / ${$.escape(doubled())} / ${$.escape(quadrupled())} / ${$.escape(time_8())} / ${$.escape(time_16())}`);
}