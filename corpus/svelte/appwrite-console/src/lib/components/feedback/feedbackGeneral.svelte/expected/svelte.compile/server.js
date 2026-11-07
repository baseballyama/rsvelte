import * as $ from 'svelte/internal/server';
import { InputTextarea } from '$lib/elements/forms';
import { feedbackData } from '$lib/stores/feedback';

export default function FeedbackGeneral($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			InputTextarea($$renderer, {
				required: true,
				id: 'feedback',
				autofocus: true,
				label: 'Tell us more about your experience',
				placeholder: 'Share your suggestions and feature requests...',
				get value() {
					return $.store_get($$store_subs ??= {}, '$feedbackData', feedbackData).message;
				},

				set value($$value) {
					$.store_mutate($$store_subs ??= {}, '$feedbackData', feedbackData, $.store_get($$store_subs ??= {}, '$feedbackData', feedbackData).message = $$value);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}