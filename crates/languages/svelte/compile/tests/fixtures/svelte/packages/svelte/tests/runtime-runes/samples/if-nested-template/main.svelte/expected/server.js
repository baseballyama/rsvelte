import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	let outer = true;
	let inner = 123;

	function outro() {
		return { duration: 100 };
	}

	if (outer) {
		$$renderer.push(`<!--[0--><div>`);

		if (inner) {
			$$renderer.push('<!--[0-->');

			const text = inner.toString();

			$$renderer.push(`${$.escape(text)} ${$.escape(inner.toString())} `);
			Component($$renderer, { value: inner });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <button>Set both to falsy</button> <button>Set outer to truthy</button>`);
}