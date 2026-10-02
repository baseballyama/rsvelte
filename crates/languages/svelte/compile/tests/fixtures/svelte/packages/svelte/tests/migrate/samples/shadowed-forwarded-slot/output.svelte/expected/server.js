import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [label]
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	let { label, children } = $$props;

	const label_render = $.derived(() => label);
	const children_render = $.derived(() => children);

	if (label) {
		$$renderer.push('<!--[0-->');
		label?.($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	{
		function label($$renderer) {
			label_render()?.($$renderer);
			$$renderer.push(`<!---->`);
		}

		MyInput($$renderer, { label, $$slots: { label: true } });
	}

	$$renderer.push(`<!----> `);

	{
		function label($$renderer) {
			$$renderer.push(`<div>`);

			{
				function label($$renderer) {
					$$renderer.push(`<div>`);
					label_render()?.($$renderer);
					$$renderer.push(`<!----></div>`);
				}

				MyComponent($$renderer, { label, $$slots: { label: true } });
			}

			$$renderer.push(`<!----></div>`);
		}

		MyInput($$renderer, { label, $$slots: { label: true } });
	}

	$$renderer.push(`<!----> `);

	{
		function children($$renderer, { args }) {
			children_render()?.($$renderer);
			$$renderer.push(`<!---->`);
		}

		MyInput($$renderer, { children, $$slots: { default: true } });
	}

	$$renderer.push(`<!----> `);

	MyInput($$renderer, {
		children: ($$renderer) => {
			function children($$renderer, { args }) {
				children_render()?.($$renderer);
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}