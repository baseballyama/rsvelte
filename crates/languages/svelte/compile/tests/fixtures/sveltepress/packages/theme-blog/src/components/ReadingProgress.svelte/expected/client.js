import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<div class="sp-reading-progress svelte-akrghc" role="progressbar" aria-label="Reading progress" aria-valuemin="0" aria-valuemax="100"></div>`);

export default function ReadingProgress($$anchor, $$props) {
	$.push($$props, true);

	const target = $.prop($$props, 'target', 3, 'article');
	let progress = $.state(0);

	onMount(() => {
		const el = document.querySelector(target());

		if (!el) return;

		let raf = 0;

		const update = () => {
			raf = 0;

			const rect = el.getBoundingClientRect();
			const total = rect.height - window.innerHeight;
			const scrolled = -rect.top;

			$.set(progress, total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : 0, true);
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

	var div = root();

	$.template_effect(
		($0) => {
			$.set_attribute(div, 'aria-valuenow', $0);
			$.set_style(div, `--progress: ${$.get(progress) ?? ''}`);
		},
		[() => Math.round($.get(progress) * 100)]
	);

	$.append($$anchor, div);
	$.pop();
}