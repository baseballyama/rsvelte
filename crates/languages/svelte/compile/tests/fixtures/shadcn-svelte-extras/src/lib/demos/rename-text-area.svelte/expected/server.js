import * as $ from 'svelte/internal/server';
import * as Rename from '$lib/components/ui/rename';

export default function Rename_text_area($$renderer) {
	let value = 'This is a text area';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="flex flex-col gap-2">`);

		if (Rename.Root) {
			$$renderer.push('<!--[-->');

			Rename.Root($$renderer, {
				this: 'p',
				inputTag: 'textarea',
				validate: (value) => value.length > 0,
				class: 'text-xl',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <p>Value: <span class="font-bold">${$.escape(value)}</span></p></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}