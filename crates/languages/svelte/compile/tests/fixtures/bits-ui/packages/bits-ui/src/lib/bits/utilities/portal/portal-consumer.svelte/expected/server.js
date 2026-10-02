import * as $ from 'svelte/internal/server';

export default function Portal_consumer($$renderer, $$props) {
	const { children } = $$props;

	$$renderer.push(`<!---->`);

	{
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	}

	$$renderer.push(`<!---->`);
}