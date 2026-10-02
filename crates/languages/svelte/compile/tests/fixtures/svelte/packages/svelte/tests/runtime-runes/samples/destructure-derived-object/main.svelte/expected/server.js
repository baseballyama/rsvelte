import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function get_values() {
		let a = 0;
		let b = 0;
		let c = 0;

		return {
			get a() {
				return a;
			},

			get b() {
				return b;
			},

			get c() {
				return c;
			},

			increment() {
				a++;
				b++;
				c++;
			}
		};
	}

	const $$d = $.derived(get_values),
		a = $.derived(() => $$d().a),
		b = $.derived(() => $$d().b),
		c = $.derived(() => $$d().c),
		increment = $.derived(() => $$d().increment);

	$$renderer.push(`<button>${$.escape(a())} ${$.escape(b())} ${$.escape(c())}</button>`);
}