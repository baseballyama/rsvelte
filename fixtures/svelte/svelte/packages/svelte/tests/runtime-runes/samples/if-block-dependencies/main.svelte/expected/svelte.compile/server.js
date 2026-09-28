import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let first = true;
	let second = false;
	let derivedSecond = $.derived(() => second);

	queueMicrotask(() => {
		first = false;
	});

	$$renderer.push(`<!---->${$.escape(first)} ${$.escape(second)} <button>Toggle</button> `);

	if (first || derivedSecond()) {
		$$renderer.push(`<!--[0-->first: ${$.escape(first)} <br/> second: ${$.escape(derivedSecond())}`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}