import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<!---->`);

	{
		$$renderer.push(`${$.escape(hi)}`);
	}

	$$renderer.push(`<!----> <!---->`);

	{
		$$renderer.push(`${$.escape(hi)}`);
	}

	$$renderer.push(`<!---->`);
}