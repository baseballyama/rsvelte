import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Component($$renderer, {
		unshadowed1,
		foo: unshadowed2,
		subthing,
		shadowed1,
		'shadowed-2': shadowed2,
		templateString: ` ${$.stringify(complex)} `,
		complex: { complex },
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { name: n, shadowed1, shadowed2, subthing }) => {
				Sub($$renderer, {
					subthing,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { subthing, othersubthing }) => {
							$$renderer.push(`<!---->${$.escape(thing)}${$.escape(subthing)}`);
						}
					}
				});
			},

			sub1: ($$renderer, { subthing }) => {
				$$renderer.push(`<p slot="sub1">${$.escape(thing)}${$.escape(subthing)}</p>`);
			},

			sub2: ($$renderer, { subthing, othersubthing }) => {
				Sub($$renderer, {
					slot: 'sub2',
					subthing,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(thing)}${$.escape(subthing)}`);
					},
					$$slots: { default: true }
				});
			}
		}
	});
}