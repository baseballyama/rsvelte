import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Component($$renderer, {
		children: ($$renderer) => {
			{
				$$renderer.push(`<p>hi</p>`);
			}
		},

		$$slots: {
			default: true,
			named: ($$renderer) => {
				{
					$$renderer.push(`<p>hi</p>`);
				}
			}
		}
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { foo, bar: baz }) => {
				{
					$$renderer.push(`<p>${$.escape(foo)} ${$.escape(baz)}</p>`);
				}
			},

			named: ($$renderer, { foo, bar: baz }) => {
				{
					$$renderer.push(`<p>${$.escape(foo)} ${$.escape(baz)}</p>`);
				}
			}
		}
	});

	$$renderer.push(`<!---->`);
}