import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	{
		function failed($$renderer, e) {
			$$renderer.push(`<p>error: ${$.escape(e)}</p>`);
		}

		$$renderer.boundary({ failed }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			{
				ComponentThatFails($$renderer, {});
			}

			$$renderer.push(`<!--]-->`);
		});
	}
}