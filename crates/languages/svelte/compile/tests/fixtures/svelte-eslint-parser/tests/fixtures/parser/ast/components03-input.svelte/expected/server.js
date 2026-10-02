import * as $ from 'svelte/internal/server';
import * as MyComponents from './MyComponents';

export default function Components03_input($$renderer) {
	if (MyComponents.MyComponent) {
		$$renderer.push('<!--[-->');

		MyComponents.MyComponent($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->contents<div></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	OtherComponents.OtherComponent($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->contents<div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}