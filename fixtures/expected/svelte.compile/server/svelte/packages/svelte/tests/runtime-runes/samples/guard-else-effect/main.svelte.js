import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let b = false;
		let v = "two";

		$$renderer.push(`<button>Trigger</button> `);

		if (v === "one") {
			$$renderer.push(`<!--[0--><div>if1 matched! ${$.escape(console.log('one'))}</div>`);
		} else if (v === "two") {
			$$renderer.push(`<!--[1--><div>if2 matched! ${$.escape(console.log('two'))}</div>`);
		} else {
			$$renderer.push(`<!--[-1--><div>nothing matched ${$.escape(console.log('else'))}</div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}