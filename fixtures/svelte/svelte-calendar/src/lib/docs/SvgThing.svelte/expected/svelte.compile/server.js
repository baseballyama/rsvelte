import * as $ from 'svelte/internal/server';
import { onMount, tick } from 'svelte';

export default function SvgThing($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const rand = (start, end) => Math.random() * (end - start) + start;

		const wrap = (val, limit) => {
			if (val < 0) return limit;
			if (val > limit) return 0;

			return val;
		};

		let w;
		let h;
		let circles = [];

		onMount(() => {
			let rafId;

			circles = Array(50).fill(0).map((_, i) => {
				const r = rand(0.01, 8);

				return {
					cx: rand(0, w),
					cy: rand(h, h * 1.1),
					vx: rand(-0.25, 0.25),
					vy: rand(-0.5, -5.8) / (r * 3),
					r
				};
			});

			const animate = async (t = Date.now()) => {
				circles = circles.map((circle) => ({
					...circle,
					cx: wrap(circle.cx + circle.vx, w + circle.r * 2),
					cy: wrap(circle.cy + circle.vy, h + circle.r * 2)
				}));

				await tick();
				rafId = requestAnimationFrame(animate);
			};

			animate();

			return cancelAnimationFrame(rafId);
		});

		$$renderer.push(`<div class="svelte-yc8gmx"><svg class="svelte-yc8gmx"><!--[-->`);

		const each_array = $.ensure_array_like(circles);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { cx, cy, r } = each_array[$$index];

			$$renderer.push(`<circle${$.attr('cx', cx)}${$.attr('cy', cy)}${$.attr('r', r)} class="svelte-yc8gmx"></circle>`);
		}

		$$renderer.push(`<!--]--></svg></div>`);
	});
}