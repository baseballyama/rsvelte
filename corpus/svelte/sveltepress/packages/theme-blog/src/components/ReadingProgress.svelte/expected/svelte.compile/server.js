import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function ReadingProgress($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { target = 'article' } = $$props;
		let progress = 0;

		onMount(() => {
			const el = document.querySelector(target);

			if (!el) return;

			let raf = 0;

			const update = () => {
				raf = 0;

				const rect = el.getBoundingClientRect();
				const total = rect.height - window.innerHeight;
				const scrolled = -rect.top;

				progress = total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : 0;
			};

			const schedule = () => {
				if (raf) return;

				raf = requestAnimationFrame(update);
			};

			update();
			window.addEventListener('scroll', schedule, { passive: true });
			window.addEventListener('resize', schedule);

			return () => {
				if (raf) cancelAnimationFrame(raf);

				window.removeEventListener('scroll', schedule);
				window.removeEventListener('resize', schedule);
			};
		});

		$$renderer.push(`<div class="sp-reading-progress svelte-akrghc" role="progressbar" aria-label="Reading progress"${$.attr('aria-valuenow', Math.round(progress * 100))} aria-valuemin="0" aria-valuemax="100"${$.attr_style(`--progress: ${$.stringify(progress)}`)}></div>`);
	});
}