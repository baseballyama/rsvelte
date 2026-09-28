import * as $ from 'svelte/internal/server';
import * as Code from '$lib/components/ui/code';

export default function Code_1($$renderer) {
	const code = `const sayHello = () => {
    console.log('Hello!');
}`;

	$$renderer.push(`<div class="w-full p-6">`);

	if (Code.Root) {
		$$renderer.push('<!--[-->');
		Code.Root($$renderer, { lang: 'typescript', class: 'w-full', code });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div>`);
}