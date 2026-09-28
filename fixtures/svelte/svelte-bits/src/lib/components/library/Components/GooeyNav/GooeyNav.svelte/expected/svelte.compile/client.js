import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<li><a class="outline-none py-[0.6em] px-[1em] inline-block svelte-3hotau"> </a></li>`);
var root_1 = $.from_html(`<div class="relative svelte-3hotau"><nav class="flex relative svelte-3hotau" style="transform:translate3d(0,0,0.01px);"><ul class="flex gap-8 list-none p-0 px-4 m-0 relative z-[3] svelte-3hotau" style="color:white;text-shadow:0 1px 1px hsl(205deg 30% 10% / 0.2);"></ul></nav> <span class="effect filter svelte-3hotau"></span> <span class="effect text svelte-3hotau"></span></div>`);

export default function GooeyNav($$anchor, $$props) {
	$.push($$props, true);

	let animationTime = $.prop($$props, 'animationTime', 3, 600),
		particleCount = $.prop($$props, 'particleCount', 3, 15),
		particleDistances = $.prop($$props, 'particleDistances', 19, () => [90, 10]),
		particleR = $.prop($$props, 'particleR', 3, 100),
		timeVariance = $.prop($$props, 'timeVariance', 3, 300),
		colors = $.prop($$props, 'colors', 19, () => [1, 2, 3, 1, 2, 3, 1, 4]),
		initialActiveIndex = $.prop($$props, 'initialActiveIndex', 3, 0);

	let containerRef;
	let navRef;
	let filterRef;
	let textRef;
	let activeIndex = $.state($.proxy(initialActiveIndex()));
	const noise = (n = 1) => n / 2 - Math.random() * n;

	function getXY(distance, pointIndex, totalPoints) {
		const angle = (360 + noise(8)) / totalPoints * pointIndex * (Math.PI / 180);

		return [distance * Math.cos(angle), distance * Math.sin(angle)];
	}

	function createParticle(i, t, d, r) {
		const rotate = noise(r / 10);

		return {
			start: getXY(d[0], particleCount() - i, particleCount()),
			end: getXY(d[1] + noise(7), particleCount() - i, particleCount()),
			time: t,
			scale: 1 + noise(0.2),
			color: colors()[Math.floor(Math.random() * colors().length)],
			rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
		};
	}

	function makeParticles(element) {
		const d = particleDistances();
		const r = particleR();
		const bubbleTime = animationTime() * 2 + timeVariance();

		element.style.setProperty('--time', `${bubbleTime}ms`);

		for (let i = 0; i < particleCount(); i++) {
			const t = animationTime() * 2 + noise(timeVariance() * 2);
			const p = createParticle(i, t, d, r);

			element.classList.remove('active');

			setTimeout(
				() => {
					const particle = document.createElement('span');
					const point = document.createElement('span');

					particle.classList.add('particle');
					particle.style.setProperty('--start-x', `${p.start[0]}px`);
					particle.style.setProperty('--start-y', `${p.start[1]}px`);
					particle.style.setProperty('--end-x', `${p.end[0]}px`);
					particle.style.setProperty('--end-y', `${p.end[1]}px`);
					particle.style.setProperty('--time', `${p.time}ms`);
					particle.style.setProperty('--scale', `${p.scale}`);
					particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
					particle.style.setProperty('--rotate', `${p.rotate}deg`);
					point.classList.add('point');
					particle.appendChild(point);
					element.appendChild(particle);
					requestAnimationFrame(() => element.classList.add('active'));

					setTimeout(
						() => {
							try {
								element.removeChild(particle);
							} catch {
								/* noop */
							}
						},
						t
					);
				},
				30
			);
		}
	}

	function updateEffectPosition(element) {
		if (!containerRef || !filterRef || !textRef) return;

		const containerRect = containerRef.getBoundingClientRect();
		const pos = element.getBoundingClientRect();

		const styles = {
			left: `${pos.x - containerRect.x}px`,
			top: `${pos.y - containerRect.y}px`,
			width: `${pos.width}px`,
			height: `${pos.height}px`
		};

		Object.assign(filterRef.style, styles);
		Object.assign(textRef.style, styles);
		textRef.innerText = element.innerText;
	}

	function handleClick(e, index) {
		const liEl = e.currentTarget.closest('li');

		if (!liEl || $.get(activeIndex) === index) return;

		$.set(activeIndex, index, true);
		updateEffectPosition(liEl);

		if (filterRef) {
			filterRef.querySelectorAll('.particle').forEach((p) => filterRef.removeChild(p));
		}

		if (textRef) {
			textRef.classList.remove('active');
			void textRef.offsetWidth;
			textRef.classList.add('active');
		}

		if (filterRef) makeParticles(filterRef);
	}

	function handleKey(e, index) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();

			const liEl = e.currentTarget.parentElement;

			if (liEl) handleClick({ currentTarget: liEl }, index);
		}
	}

	onMount(() => {
		if (!navRef || !containerRef) return;

		const lis = navRef.querySelectorAll('li');
		const activeLi = lis[$.get(activeIndex)];

		if (activeLi) {
			updateEffectPosition(activeLi);
			textRef?.classList.add('active');
		}

		const ro = new ResizeObserver(() => {
			const cur = navRef?.querySelectorAll('li')[$.get(activeIndex)];

			if (cur) updateEffectPosition(cur);
		});

		ro.observe(containerRef);

		return () => ro.disconnect();
	});

	var div = root_1();
	var nav = $.child(div);
	var ul = $.child(nav);

	$.each(ul, 21, () => $$props.items, $.index, ($$anchor, item, index) => {
		var li = root();
		var a = $.child(li);
		var text = $.only_child(a, true);

		$.reset(li);

		$.template_effect(() => {
			$.set_class(li, 1, `rounded-full relative cursor-pointer transition-[background-color_color_box-shadow] duration-300 ease shadow-[0_0_0.5px_1.5px_transparent] text-white ${$.get(activeIndex) === index ? 'active' : ''}`, 'svelte-3hotau');
			$.set_attribute(a, 'href', $.get(item).href);
			$.set_text(text, $.get(item).label);
		});

		$.delegated('click', a, (e) => handleClick(e, index));
		$.delegated('keydown', a, (e) => handleKey(e, index));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.bind_this(ul, ($$value) => navRef = $$value, () => navRef);
	$.reset(nav);

	var span = $.sibling(nav, 2);

	$.bind_this(span, ($$value) => filterRef = $$value, () => filterRef);

	var span_1 = $.sibling(span, 2);

	$.bind_this(span_1, ($$value) => textRef = $$value, () => textRef);
	$.reset(div);
	$.bind_this(div, ($$value) => containerRef = $$value, () => containerRef);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown']);