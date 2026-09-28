import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { gsap } from 'gsap';

var root = $.from_html(`<div class="absolute top-0 left-0 h-full w-full bg-cover bg-center"></div>`);
var root_1 = $.from_html(`<div class="z-[1] p-4 text-center"> </div>`);
var root_2 = $.from_html(`<div class="relative"><div class="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[10px] bg-[#111] text-[1.5rem] text-white"><!></div></div>`);
var root_3 = $.from_html(`<div class="grid grid-cols-7 gap-4" style="will-change: transform, filter"></div>`);
var root_4 = $.from_html(`<div class="h-full w-full overflow-hidden"><section class="relative flex h-screen w-full items-center justify-center overflow-hidden"><div class="pointer-events-none absolute inset-0 z-[4]" style="background-size: 250px"></div> <div class="relative z-[2] grid h-[150vh] w-[150vw] flex-none origin-center -rotate-[15deg] grid-cols-1 grid-rows-4 gap-4"></div></section></div>`);

export default function GridMotion($$anchor, $$props) {
	$.push($$props, true);

	let items = $.prop($$props, 'items', 19, () => []),
		gradientColor = $.prop($$props, 'gradientColor', 3, 'black');

	const totalItems = 28;
	const defaults = Array.from({ length: totalItems }, (_, i) => `Item ${i + 1}`);
	const combinedItems = $.derived(() => items().length > 0 ? items().slice(0, totalItems) : defaults);
	let rowEls = $.proxy([null, null, null, null]);
	let mouseX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;

	onMount(() => {
		gsap.ticker.lagSmoothing(0);

		const handleMouseMove = (e) => {
			mouseX = e.clientX;
		};

		const updateMotion = () => {
			const maxMoveAmount = 300;
			const baseDuration = 0.8;
			const inertiaFactors = [0.6, 0.4, 0.3, 0.2];

			rowEls.forEach((row, index) => {
				if (row) {
					const direction = index % 2 === 0 ? 1 : -1;
					const moveAmount = (mouseX / window.innerWidth * maxMoveAmount - maxMoveAmount / 2) * direction;

					gsap.to(row, {
						x: moveAmount,
						duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
						ease: 'power3.out',
						overwrite: 'auto'
					});
				}
			});
		};

		const remove = gsap.ticker.add(updateMotion);

		window.addEventListener('mousemove', handleMouseMove);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			remove();
		};
	});

	var div = root_4();
	var section = $.child(div);
	var div_1 = $.sibling($.child(section), 2);

	$.each(div_1, 20, () => [0, 1, 2, 3], (rowIndex) => rowIndex, ($$anchor, rowIndex) => {
		var div_2 = root_3();

		$.each(div_2, 20, () => Array.from({ length: 7 }, (_, i) => i), (itemIndex) => itemIndex, ($$anchor, itemIndex) => {
			const content = $.derived(() => $.get(combinedItems)[rowIndex * 7 + itemIndex]);
			var div_3 = root_2();
			var div_4 = $.child(div_3);
			var node = $.child(div_4);

			{
				var consequent = ($$anchor) => {
					var div_5 = root();

					$.template_effect(() => $.set_style(div_5, `background-image: url(${$.get(content) ?? ''})`));
					$.append($$anchor, div_5);
				};

				var d = $.derived(() => typeof $.get(content) === 'string' && $.get(content).startsWith('http'));

				var alternate = ($$anchor) => {
					var div_6 = root_1();
					var text = $.only_child(div_6, true);

					$.template_effect(() => $.set_text(text, $.get(content)));
					$.append($$anchor, div_6);
				};

				$.if(node, ($$render) => {
					if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div_4);
			$.reset(div_3);
			$.append($$anchor, div_3);
		});

		$.reset(div_2);
		$.bind_this(div_2, ($$value, rowIndex) => rowEls[rowIndex] = $$value, (rowIndex) => rowEls?.[rowIndex], () => [rowIndex]);
		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(section);
	$.reset(div);
	$.template_effect(() => $.set_style(section, `background: radial-gradient(circle, ${gradientColor() ?? ''} 0%, transparent 100%)`));
	$.append($$anchor, div);
	$.pop();
}