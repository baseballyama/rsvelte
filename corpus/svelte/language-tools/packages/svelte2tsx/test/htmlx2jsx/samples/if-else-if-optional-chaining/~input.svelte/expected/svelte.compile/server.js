import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (obj?.name1 == "world") {
		$$renderer.push(`<!--[0--><h1>Hello ${$.escape(name2)}</h1>`);
	} else if (obj?.name3 == "person") {
		$$renderer.push(`<!--[1--><h2>hello ${$.escape(name4)}</h2>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}