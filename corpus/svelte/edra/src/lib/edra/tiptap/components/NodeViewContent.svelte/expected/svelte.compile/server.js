import * as $ from 'svelte/internal/server';

export default function NodeViewContent($$renderer, $$props) {
	let { as = 'div', class: className } = $$props;

	$$renderer.push(`<!---->`);

	{
		$.element($$renderer, as, () => {
			$$renderer.push(`${$.attr_class($.clsx(className))} data-node-view-content="" style="white-space: pre-wrap"`);
		});
	}

	$$renderer.push(`<!---->`);
}