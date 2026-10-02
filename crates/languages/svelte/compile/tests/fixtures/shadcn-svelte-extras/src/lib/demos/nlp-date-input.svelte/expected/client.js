import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NLPDateInput } from '$lib/components/ui/nlp-date-input';
import { toast } from 'svelte-sonner';

var root = $.from_html(`<div class="flex w-full max-w-xl items-center justify-center"><div class="h-72 w-full py-6"><!></div></div>`);

export default function Nlp_date_input($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	NLPDateInput(node, {
		onChoice: ({ date, label }) => toast.success(label, {
			description: `${date.toDateString()} ${date.toLocaleTimeString()}`
		})
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}