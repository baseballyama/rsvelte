import * as $ from 'svelte/internal/server';
import { NLPDateInput } from '$lib/components/ui/nlp-date-input';
import { toast } from 'svelte-sonner';

export default function Nlp_date_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="flex w-full max-w-xl items-center justify-center"><div class="h-72 w-full py-6">`);

		NLPDateInput($$renderer, {
			onChoice: ({ date, label }) => toast.success(label, {
				description: `${date.toDateString()} ${date.toLocaleTimeString()}`
			})
		});

		$$renderer.push(`<!----></div></div>`);
	});
}