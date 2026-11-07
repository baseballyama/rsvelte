import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	let { data } = $$props;
	let tmp = data, foo = tmp.foo;

	$$renderer.push(`<!---->${$.escape(foo)}`);
}