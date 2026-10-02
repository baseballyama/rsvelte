import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, tick } from 'svelte';

var root = $.from_svg(`<circle class="svelte-yc8gmx"></circle>`);
var root_1 = $.from_html(`<div class="svelte-yc8gmx"><svg class="svelte-yc8gmx"></svg></div>`);

export default function SvgThing($$anchor, $$props) {
	$.push($$props, true);

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

	var div = root_1();
	var svg = $.child(div);

	$.each(svg, 21, () => circles, $.index, ($$anchor, $$item) => {
		let cx = () => $.get($$item).cx;
		let cy = () => $.get($$item).cy;
		let r = () => $.get($$item).r;
		var circle_1 = root();

		$.template_effect(() => {
			$.set_attribute(circle_1, 'cx', cx());
			$.set_attribute(circle_1, 'cy', cy());
			$.set_attribute(circle_1, 'r', r());
		});

		$.append($$anchor, circle_1);
	});

	$.reset(svg);
	$.reset(div);
	$.bind_element_size(div, 'offsetWidth', ($$value) => w = $$value);
	$.bind_element_size(div, 'offsetHeight', ($$value) => h = $$value);
	$.append($$anchor, div);
	$.pop();
}