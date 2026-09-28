import * as $ from 'svelte/internal/server';
import { run } from 'svelte/legacy';

export default function Output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		let double = $.derived(() => count * 2);
		let quadruple = void 0;

		run(() => {
			quadruple = count * 4;
			console.log("i have a side effect");
		});

		let eight_times = void 0;

		run(() => {
			// updated
			eight_times = count * 8;
		});

		let sixteen_times = void 0;

		run(() => {
			// reassigned outside labeled statement
			sixteen_times = count * 16;
		});

		let alot_times = void 0;

		run(() => {
			// reassigned in multiple labeled
			alot_times = count * 32;
		});

		run(() => {
			// reassigned in multiple labeled
			alot_times = count * 32;
		});

		let evenmore = void 0;
		let evenmore_doubled = void 0;

		run(() => {
			// multiple stuff in label
			evenmore = count * 64;

			evenmore_doubled = evenmore * 2;
		});

		let almost_infinity = $.derived(() => count * 128);
		let should_be_state = 42;
		let should_be_state_too = 42;

		$$renderer.push(`<button>click</button>`);
	});
}