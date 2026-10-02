import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InputTextarea } from '$lib/elements/forms';
import { feedbackData } from '$lib/stores/feedback';

export default function FeedbackGeneral($$anchor, $$props) {
	$.push($$props, true);

	const $feedbackData = () => $.store_get(feedbackData, '$feedbackData', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	InputTextarea($$anchor, {
		required: true,
		id: 'feedback',
		autofocus: true,
		label: 'Tell us more about your experience',
		placeholder: 'Share your suggestions and feature requests...',
		get value() {
			return $feedbackData().message;
		},

		set value($$value) {
			$.store_mutate(feedbackData, $.untrack($feedbackData).message = $$value, $.untrack($feedbackData));
		}
	});

	$.pop();
	$$cleanup();
}