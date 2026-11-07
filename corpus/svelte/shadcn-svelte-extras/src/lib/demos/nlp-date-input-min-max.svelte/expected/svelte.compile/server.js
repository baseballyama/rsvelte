import * as $ from 'svelte/internal/server';
import { NLPDateInput } from '$lib/components/ui/nlp-date-input';
import { toast } from 'svelte-sonner';

export default function Nlp_date_input_min_max($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const DAY = 24 * 60 * 60 * 1000;

		$$renderer.push(`<div class="flex w-full max-w-xl items-center justify-center"><div class="h-72 w-full py-6">`);

		NLPDateInput($$renderer, {
			placeholder: 'E.g. "this evening" or "2 hours from now"',
			min: new Date(),
			max: new Date(Date.now() + DAY),
			onChoice: ({ date, label }) => toast.success(label, {
				description: `${date.toDateString()} ${date.toLocaleTimeString()}`
			})
		});

		$$renderer.push(`<!----></div></div>`);
	});
}