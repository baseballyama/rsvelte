import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let caption = 'a foo in its natural habitat';

	$$renderer.push(`<figure><img src="foo.jpg" alt="a foo"/> `);

	if (caption) {
		$$renderer.push(`<!--[0--><figcaption>a foo in its natural habitat</figcaption>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></figure>`);
}