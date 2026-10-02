import * as $ from 'svelte/internal/server';
import { Pane, Splitpanes } from 'svelte-splitpanes';
import TextArea from '$comp/TextAreaAutosize.svelte';

export default function Code($$renderer) {
	let val = '// Event name: Event params   (Last event at the top)';

	function handleMessage(event) {
		if (event.detail) val = event.type + ' ' + JSON.stringify(event.detail) + '\n' + val; else val = event.type + '\n' + val;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Splitpanes($$renderer, {
			style: 'height: 400px',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like({ length: 3 });

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let _ = each_array[i];

					Pane($$renderer, {
						minSize: 10,
						children: ($$renderer) => {
							$$renderer.push(`<span>${$.escape(i + 1)}</span>`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p>Try resizing panes and check the logs bellow.</p> `);

		TextArea($$renderer, {
			minRows: 4,
			maxRows: 40,
			get value() {
				return val;
			},

			set value($$value) {
				val = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}