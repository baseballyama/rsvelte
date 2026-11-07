import * as $ from 'svelte/internal/server';
import MyComponent from './MyComponent.svelte';

export default function Non_element01_input($$renderer) {
	let foo;
	let bar;

	const remove = () => {
		foo.remove();
		bar.remove();
	};

	MyComponent($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->div`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	if (MyComponent) {
		$$renderer.push('<!--[-->');

		MyComponent($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->div`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` <button>Click Me</button>`);
}