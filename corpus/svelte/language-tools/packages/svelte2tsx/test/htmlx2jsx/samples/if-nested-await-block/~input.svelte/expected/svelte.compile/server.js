import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (hello) {
		$$renderer.push('<!--[0-->');

		$.await($$renderer, hello.foo, () => {}, (y) => {
			$$renderer.push(`${$.escape(y)}`);
		});

		$$renderer.push(`<!--]--> `);

		$.await($$renderer, x, () => {}, (y) => {
			$$renderer.push(`${$.escape(y)}`);
		});

		$$renderer.push(`<!--]--> `);

		$.await(
			$$renderer,
			aPromise,
			() => {
				$$renderer.push(`${$.escape(hello)}`);
			},
			() => {}
		);

		$$renderer.push(`<!--]--> `);

		if (hi && bye) {
			$$renderer.push('<!--[0-->');

			$.await($$renderer, x, () => {}, (y) => {
				$$renderer.push(`${$.escape(y)}`);
			});

			$$renderer.push(`<!--]-->`);
		} else if (cool) {
			$$renderer.push('<!--[1-->');

			$.await(
				$$renderer,
				x,
				() => {
					$$renderer.push(`loading`);
				},
				(y) => {
					$$renderer.push(`${$.escape(y)}`);
				}
			);

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');

			$.await($$renderer, x, () => {}, (y) => {
				$$renderer.push(`${$.escape(y)}`);
			});

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}