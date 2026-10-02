import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Parent($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { foo, bar: baz }) => {
				Component($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { blubb }) => {
							$$renderer.push(`<!---->${$.escape(blubb)}`);
						}
					}
				});
			},

			named: ($$renderer, { bla }) => {
				Component($$renderer, {
					slot: 'named',
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(foo)} ${$.escape(baz)} ${$.escape(bla)}`);
					},
					$$slots: { default: true }
				});
			}
		}
	});
}