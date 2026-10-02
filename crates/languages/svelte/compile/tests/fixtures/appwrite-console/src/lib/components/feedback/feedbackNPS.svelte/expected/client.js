import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Evaluation from './evaluation.svelte';
import { feedbackData } from '$lib/stores/feedback';
import { InputTextarea } from '$lib/elements/forms';

var root = $.from_html(`<!> <!>`, 1);

export default function FeedbackNPS($$anchor, $$props) {
	$.push($$props, true);

	const $feedbackData = () => $.store_get(feedbackData, '$feedbackData', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = root();
	var node = $.first_child(fragment);

	Evaluation(node, {
		get value() {
			return $feedbackData().value;
		},

		set value($$value) {
			$.store_mutate(feedbackData, $.untrack($feedbackData).value = $$value, $.untrack($feedbackData));
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			InputTextarea($$anchor, {
				id: 'feedback',
				label: 'Tell us more about your experience (optional)',
				placeholder: 'Share your suggestions and feature requests...',
				helper: 'Need help? Join our Discord for community support',
				get value() {
					return $feedbackData().message;
				},

				set value($$value) {
					$.store_mutate(feedbackData, $.untrack($feedbackData).message = $$value, $.untrack($feedbackData));
				}
			});
		};

		$.if(node_1, ($$render) => {
			if ($feedbackData().value !== null) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}