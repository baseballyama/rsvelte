import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { browser } = $$props;
		let fulfil;
		let promise = new Promise((f) => fulfil = f);
		let a = browser ? promise : 42;
		let b = browser ? 42 : promise;

		$$renderer.push(`<button>fulfil</button> `);

		$.await(
			$$renderer,
			a,
			() => {
				if (true) {
					$$renderer.push(`<!--[0--><p>loading...</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			(a) => {
				$$renderer.push(`<p>${$.escape(a)}</p>`);
			}
		);

		$$renderer.push(`<!--]--> <hr/> `);

		$.await(
			$$renderer,
			b,
			() => {
				if (true) {
					$$renderer.push(`<!--[0--><p>loading...</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			(b) => {
				$$renderer.push(`<p>${$.escape(b)}</p>`);
			}
		);

		$$renderer.push(`<!--]-->`);
	});
}