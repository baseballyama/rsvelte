import * as $ from 'svelte/internal/server';

export default function Check_cases($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let n = 'x';
		let { label } = $$props;
		let count = 0;
		let maybe = void 0;
		$$renderer.push(`<button type="button">${$.escape(label.foo)}</button> `);
		if (maybe) {
			$$renderer.push(`<!--[0--><p>${$.escape(maybe.length)}</p>`);
		} else {
			$$renderer.push(`<!--[-1--><p>${$.escape(maybe.length)}</p>`);
		}
		$$renderer.push(`<!--]--> <p${$.attr('title', `a${$.stringify(count.bar)}b`)}>😀 ${$.escape(label.baz)}</p>`);
	});
}
