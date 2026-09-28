import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NLPDateInput } from '$lib/components/ui/nlp-date-input';
import { toast } from 'svelte-sonner';

var root = $.from_html(`<div class="flex w-full max-w-xl items-center justify-center"><div class="h-72 w-full py-6"><!></div></div>`);

export default function Nlp_date_input_min_max($$anchor, $$props) {
	$.push($$props, true);

	const DAY = 24 * 60 * 60 * 1000;
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	NLPDateInput(node, {
		placeholder: 'E.g. "this evening" or "2 hours from now"',
		min: new Date(),
		max: new Date(Date.now() + DAY),
		onChoice: ({ date, label }) => toast.success(label, {
			description: `${date.toDateString()} ${date.toLocaleTimeString()}`
		})
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}