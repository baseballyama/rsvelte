import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);

	if ($$slots.label) {
		$$renderer.push(`<!--[0--><!--[-->`);
		$.slot($$renderer, $$props, 'label', {}, null);
		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	MyInput($$renderer, {
		$$slots: {
			label: ($$renderer) => {
				$$renderer.push(`<!--[-->`);
				$.slot($$renderer, $$props, 'label', {}, null);
				$$renderer.push(`<!--]-->`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	MyInput($$renderer, {
		$$slots: {
			label: ($$renderer) => {
				$$renderer.push(`<div slot="label">`);

				MyComponent($$renderer, {
					$$slots: {
						label: ($$renderer) => {
							$$renderer.push(`<div slot="label"><!--[-->`);
							$.slot($$renderer, $$props, 'label', {}, null);
							$$renderer.push(`<!--]--></div>`);
						}
					}
				});

				$$renderer.push(`<!----></div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	MyInput($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				$$renderer.push(`<!--[-->`);
				$.slot($$renderer, $$props, 'default', {}, null);
				$$renderer.push(`<!--]-->`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	MyInput($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div><!--[-->`);
			$.slot($$renderer, $$props, 'default', {}, null);
			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}