import * as $ from 'svelte/internal/server';
import Zap from "@lucide/svelte/icons/zap";
import Cpu from "@lucide/svelte/icons/cpu";
import Lock from "@lucide/svelte/icons/lock";
import Sparkles from "@lucide/svelte/icons/sparkles";

export default function Content_five($$renderer) {
	$$renderer.push(`<section class="py-16 md:py-32"><div class="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12"><div class="mx-auto max-w-xl space-y-6 text-center md:space-y-12"><h2 class="text-4xl font-medium text-balance lg:text-5xl">The Lyra ecosystem brings together our models, products and platforms.</h2> <p>Lyra is evolving to be more than just the models. It supports an entire ecosystem —
				from products to the APIs and platforms helping developers and businesses innovate.</p></div> <img class="rounded-(--radius) grayscale" src="https://images.unsplash.com/photo-1616587226960-4a03badbe8bf?q=80&amp;w=2940&amp;auto=format&amp;fit=crop&amp;ixlib=rb-4.0.3&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="team_img" loading="lazy"/> <div class="relative mx-auto grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4"><div class="space-y-3"><div class="flex items-center gap-2">`);

	Zap($$renderer, { class: 'size-4' });
	$$renderer.push(`<!----> <h3 class="text-sm font-medium">Faaast</h3></div> <p class="text-sm text-muted-foreground">It supports an entire helping developers and innovate.</p></div> <div class="space-y-2"><div class="flex items-center gap-2">`);
	Cpu($$renderer, { class: 'size-4' });
	$$renderer.push(`<!----> <h3 class="text-sm font-medium">Powerful</h3></div> <p class="text-sm text-muted-foreground">It supports an entire helping developers and businesses.</p></div> <div class="space-y-2"><div class="flex items-center gap-2">`);
	Lock($$renderer, { class: 'size-4' });
	$$renderer.push(`<!----> <h3 class="text-sm font-medium">Security</h3></div> <p class="text-sm text-muted-foreground">It supports an helping developers businesses innovate.</p></div> <div class="space-y-2"><div class="flex items-center gap-2">`);
	Sparkles($$renderer, { class: 'size-4' });
	$$renderer.push(`<!----> <h3 class="text-sm font-medium">AI Powered</h3></div> <p class="text-sm text-muted-foreground">It supports an helping developers businesses innovate.</p></div></div></div></section>`);
}