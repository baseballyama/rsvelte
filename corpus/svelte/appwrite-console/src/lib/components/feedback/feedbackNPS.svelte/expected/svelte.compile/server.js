import * as $ from 'svelte/internal/server';
import Evaluation from './evaluation.svelte';
import { feedbackData } from '$lib/stores/feedback';
import { InputTextarea } from '$lib/elements/forms';

export default function FeedbackNPS($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Evaluation($$renderer, {
				get value() {
					return $.store_get($$store_subs ??= {}, '$feedbackData', feedbackData).value;
				},

				set value($$value) {
					$.store_mutate($$store_subs ??= {}, '$feedbackData', feedbackData, $.store_get($$store_subs ??= {}, '$feedbackData', feedbackData).value = $$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if ($.store_get($$store_subs ??= {}, '$feedbackData', feedbackData).value !== null) {
				$$renderer.push('<!--[0-->');

				InputTextarea($$renderer, {
					id: 'feedback',
					label: 'Tell us more about your experience (optional)',
					placeholder: 'Share your suggestions and feature requests...',
					helper: 'Need help? Join our Discord for community support',
					get value() {
						return $.store_get($$store_subs ??= {}, '$feedbackData', feedbackData).message;
					},

					set value($$value) {
						$.store_mutate($$store_subs ??= {}, '$feedbackData', feedbackData, $.store_get($$store_subs ??= {}, '$feedbackData', feedbackData).message = $$value);
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
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