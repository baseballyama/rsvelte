import * as $ from 'svelte/internal/server';
import ArrowRight from '@lucide/svelte/icons/arrow-right';

export default function Banner_02($$renderer) {
	$$renderer.push(`<div class="dark bg-muted text-foreground px-4 py-3"><p class="flex justify-center text-sm"><a href="#title" class="group"><span class="me-1 text-base leading-none">✨</span>Introducing transactional and marketing
			emails `);

	ArrowRight($$renderer, {
		class: 'ms-2 -mt-0.5 inline-flex opacity-60 transition-transform group-hover:translate-x-0.5',
		size: 16,
		'aria-hidden': 'true'
	});

	$$renderer.push(`<!----></a></p></div>`);
}