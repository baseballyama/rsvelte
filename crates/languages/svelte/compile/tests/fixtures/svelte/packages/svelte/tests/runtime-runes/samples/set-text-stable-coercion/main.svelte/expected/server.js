import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Widget {
			toString() {
				return "toString";
			}

			valueOf() {
				return "valueOf";
			}
		}

		const value = new Widget();

		$$renderer.push(`<!---->${$.escape(value)} <p>${$.escape(value)}</p> <p>[${$.escape(value)}]</p> `);

		if (1) {
			$$renderer.push(`<!--[0-->${$.escape(value)}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}