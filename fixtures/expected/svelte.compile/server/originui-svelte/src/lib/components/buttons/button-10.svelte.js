import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ArrowRight from '@lucide/svelte/icons/arrow-right';
import Mail from '@lucide/svelte/icons/mail';

export default function Button_10($$renderer) {
	Button($$renderer, {
		class: 'group',
		variant: 'secondary',
		children: ($$renderer) => {
			Mail($$renderer, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----> Button `);

			ArrowRight($$renderer, {
				class: '-me-1 opacity-60 transition-transform group-hover:translate-x-0.5',
				size: 16,
				'aria-hidden': 'true'
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}