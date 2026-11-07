import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let a = 0;
		let b = 0;
		let c = 0;

		const $$d = $.derived(() => ({ a, b, c })),
			a1 = $.derived(() => $$d().a),
			b1 = $.derived(() => $$d().b),
			c1 = $.derived(() => $$d().c);

		$$renderer.push(`<button>${$.escape(a1())}</button> <button>${$.escape(b1())}</button> <button>${$.escape(c1())}</button>`);
	});
}