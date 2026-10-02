import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (hello) {
		$$renderer.push('<!--[0-->');

		Comp($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { foo }) => {
					$$renderer.push(`<!---->${$.escape(foo)}`);
				}
			}
		});

		$$renderer.push(`<!----> `);

		if (hi && bye) {
			$$renderer.push('<!--[0-->');

			Comp($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { foo: bar }) => {
						$$renderer.push(`<!---->${$.escape(bar)}`);
					}
				}
			});
		} else if (cool) {
			$$renderer.push('<!--[1-->');

			Comp($$renderer, {
				$$slots: {
					named: ($$renderer, { foo, foo1 }) => {
						$$renderer.push(`<div slot="named">${$.escape(foo)}</div>`);
					}
				}
			});
		} else {
			$$renderer.push('<!--[-1-->');

			Comp($$renderer, {
				$$slots: {
					named: ($$renderer, { foo: bar }) => {
						$$renderer.push(`<div slot="named">${$.escape(bar)}</div>`);
					}
				}
			});
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}