import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Foo($$renderer, {
		slot: 'foo',
		children: ($$renderer) => {
			$$renderer.push(`<!---->valid`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Foo($$renderer, {
		slot: foo,
		children: ($$renderer) => {
			$$renderer.push(`<!---->valid`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Foo($$renderer, {
		children: ($$renderer) => {
			if (true) {
				$$renderer.push('<!--[0-->');

				Foo($$renderer, {
					slot: 'foo',
					children: ($$renderer) => {
						$$renderer.push(`<!---->valid`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Foo($$renderer, {
					slot: foo,
					children: ($$renderer) => {
						$$renderer.push(`<!---->valid`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}