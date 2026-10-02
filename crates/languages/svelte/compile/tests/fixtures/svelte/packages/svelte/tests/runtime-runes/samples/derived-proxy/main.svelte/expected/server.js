import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;

	let double = $.derived(() => ({
		get value() {
			return count * 2;
		},

		set value(c) {
			count = c / 2;
		}
	}));

	$$renderer.push(`<button>${$.escape(count)} / ${$.escape(double().value)}</button> <button>${$.escape(count)} / ${$.escape(double().value)}</button>`);
}