import * as $ from 'svelte/internal/server';

export default function Test($$renderer, $$props) {
	let z = 8;
	let { a, b = a, c = b * b, d = z * b + c } = $$props;

	$$renderer.push(`<p>${$.escape(a)}</p> <p>${$.escape(b)}</p> <p>${$.escape(c)}</p> <p>${$.escape(d)}</p>`);
}