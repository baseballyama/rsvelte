import * as $ from 'svelte/internal/server';
import { TextArea } from "carbon-components-svelte";

export default function TextAreaFixture($$renderer) {
	let value = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TextArea($$renderer, {
			'data-testid': 'text-area-comment',
			labelText: 'Comment',
			placeholder: 'Enter your comment',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}