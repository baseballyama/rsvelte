import * as $ from 'svelte/internal/server';

export default function MarkViewContent($$renderer, $$props) {
	let { as = 'span', class: className } = $$props;

	$$renderer.push(`<!---->`);

	{
		$.element($$renderer, as, () => {
			$$renderer.push(`${$.attr_class($.clsx(className))} data-mark-view-content="" style="white-space: inherit"`);
		});
	}

	$$renderer.push(`<!---->`);
}