import * as $ from 'svelte/internal/server';
import { Clipboard, Textarea } from "flowbite-svelte";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

export default function Textarea_1($$renderer) {
	let value = "";
	let success = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		{
			function addon($$renderer) {
				if (value.length > 0) {
					$$renderer.push('<!--[0-->');

					Clipboard($$renderer, {
						color: success ? "alternative" : "light",
						size: 'sm',
						class: 'absolute end-2 top-2 h-8 w-32 px-2.5 font-medium focus:ring-0',
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						get success() {
							return success;
						},

						set success($$value) {
							success = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (success) {
								$$renderer.push('<!--[0-->');
								CheckOutline($$renderer, { class: 'h-3 w-3' });
								$$renderer.push(`<!----> Copied`);
							} else {
								$$renderer.push('<!--[-1-->');
								ClipboardCleanSolid($$renderer, { class: 'h-3 w-3' });
								$$renderer.push(`<!----> Copy text`);
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			Textarea($$renderer, {
				id: 'textarea-id',
				placeholder: 'Your message',
				rows: 4,
				name: 'message',
				class: 'w-full',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},
				addon,
				$$slots: { addon: true }
			});
		}
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}