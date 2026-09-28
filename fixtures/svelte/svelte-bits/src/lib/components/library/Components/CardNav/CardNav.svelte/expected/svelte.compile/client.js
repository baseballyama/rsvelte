import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { gsap } from 'gsap';

var root = $.from_html(`<a class="nav-card-link inline-flex items-center gap-[6px] no-underline cursor-pointer transition-opacity duration-300 hover:opacity-75 text-[15px] md:text-[16px]"><svg class="nav-card-link-icon shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg> </a>`);
var root_1 = $.from_html(`<div class="nav-card select-none relative flex flex-col gap-2 p-[12px_16px] rounded-[calc(0.75rem-0.2rem)] min-w-0 flex-[1_1_auto] h-auto min-h-[60px] md:h-full md:min-h-0 md:flex-[1_1_0%]"><div class="nav-card-label font-normal tracking-[-0.5px] text-[18px] md:text-[22px]"> </div> <div class="nav-card-links mt-auto flex flex-col gap-[2px]"></div></div>`);
var root_2 = $.from_html(`<div><nav><div class="card-nav-top absolute inset-x-0 top-0 h-[60px] flex items-center justify-between p-2 pl-[1.1rem] z-[2]"><div role="button" tabindex="0"><div></div> <div></div></div> <div class="logo-container flex items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 order-1 md:order-none"><img class="logo h-[28px]"/></div> <button type="button" class="card-nav-cta-button hidden md:inline-flex border-0 rounded-[calc(0.75rem-0.2rem)] px-4 items-center h-full font-medium cursor-pointer transition-colors duration-300">Get Started</button></div> <div></div></nav></div>`);

export default function CardNav($$anchor, $$props) {
	$.push($$props, true);

	let logoAlt = $.prop($$props, 'logoAlt', 3, 'Logo'),
		className = $.prop($$props, 'class', 3, ''),
		ease = $.prop($$props, 'ease', 3, 'power3.out'),
		baseColor = $.prop($$props, 'baseColor', 3, '#fff');

	let isHamburgerOpen = $.state(false);
	let isExpanded = $.state(false);
	let navRef;
	const cardRefs = [];
	let tl = null;

	function calculateHeight() {
		if (!navRef) return 260;

		const isMobile = window.matchMedia('(max-width: 768px)').matches;

		if (isMobile) {
			const contentEl = navRef.querySelector('.card-nav-content');

			if (contentEl) {
				const wasVis = contentEl.style.visibility;
				const wasPe = contentEl.style.pointerEvents;
				const wasPos = contentEl.style.position;
				const wasH = contentEl.style.height;

				contentEl.style.visibility = 'visible';
				contentEl.style.pointerEvents = 'auto';
				contentEl.style.position = 'static';
				contentEl.style.height = 'auto';
				void contentEl.offsetHeight;

				const topBar = 60;
				const padding = 16;
				const ch = contentEl.scrollHeight;

				contentEl.style.visibility = wasVis;
				contentEl.style.pointerEvents = wasPe;
				contentEl.style.position = wasPos;
				contentEl.style.height = wasH;

				return topBar + ch + padding;
			}
		}

		return 260;
	}

	function createTimeline() {
		if (!navRef) return null;

		gsap.set(navRef, { height: 60, overflow: 'hidden' });
		gsap.set(cardRefs, { y: 50, opacity: 0 });

		const _tl = gsap.timeline({ paused: true });

		_tl.to(navRef, { height: calculateHeight, duration: 0.4, ease: ease() });
		_tl.to(cardRefs, { y: 0, opacity: 1, duration: 0.4, ease: ease(), stagger: 0.08 }, '-=0.1');

		return _tl;
	}

	onMount(() => {
		tl = createTimeline();

		const handleResize = () => {
			if (!tl) return;

			if ($.get(isExpanded)) {
				gsap.set(navRef, { height: calculateHeight() });
				tl.kill();

				const next = createTimeline();

				if (next) {
					next.progress(1);
					tl = next;
				}
			} else {
				tl.kill();

				const next = createTimeline();

				if (next) tl = next;
			}
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			tl?.kill();
			tl = null;
		};
	});

	function toggleMenu() {
		if (!tl) return;

		if (!$.get(isExpanded)) {
			$.set(isHamburgerOpen, true);
			$.set(isExpanded, true);
			tl.play(0);
		} else {
			$.set(isHamburgerOpen, false);
			tl.eventCallback('onReverseComplete', () => $.set(isExpanded, false));
			tl.reverse();
		}
	}

	var div = root_2();
	var nav = $.child(div);
	var div_1 = $.child(nav);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var div_4 = $.sibling(div_3, 2);

	$.reset(div_2);

	var div_5 = $.sibling(div_2, 2);
	var img = $.only_child(div_5);
	var button = $.sibling(div_5, 2);

	$.reset(div_1);

	var div_6 = $.sibling(div_1, 2);

	$.each(div_6, 21, () => ($$props.items || []).slice(0, 3), $.index, ($$anchor, item, idx) => {
		var div_7 = root_1();
		var div_8 = $.child(div_7);
		var text = $.only_child(div_8, true);
		var div_9 = $.sibling(div_8, 2);

		$.each(div_9, 21, () => $.get(item).links ?? [], $.index, ($$anchor, lnk) => {
			var a = root();
			var text_1 = $.sibling($.child(a));

			$.reset(a);

			$.template_effect(() => {
				$.set_attribute(a, 'href', $.get(lnk).href);
				$.set_attribute(a, 'aria-label', $.get(lnk).ariaLabel);
				$.set_text(text_1, ` ${$.get(lnk).label ?? ''}`);
			});

			$.append($$anchor, a);
		});

		$.reset(div_9);
		$.reset(div_7);
		$.bind_this(div_7, ($$value, idx) => cardRefs[idx] = $$value, (idx) => cardRefs?.[idx], () => [idx]);

		$.template_effect(() => {
			$.set_style(div_7, `background-color:${$.get(item).bgColor ?? ''}; color:${$.get(item).textColor ?? ''};`);
			$.set_text(text, $.get(item).label);
		});

		$.append($$anchor, div_7);
	});

	$.reset(div_6);
	$.reset(nav);
	$.bind_this(nav, ($$value) => navRef = $$value, () => navRef);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `card-nav-container absolute left-1/2 -translate-x-1/2 w-[90%] max-w-[800px] z-[99] top-[1.2em] md:top-[2em] ${className() ?? ''}`);
		$.set_class(nav, 1, `card-nav ${$.get(isExpanded) ? 'open' : ''} block h-[60px] p-0 rounded-xl shadow-md relative overflow-hidden will-change-[height]`);
		$.set_style(nav, `background-color:${baseColor() ?? ''};`);
		$.set_class(div_2, 1, `hamburger-menu ${$.get(isHamburgerOpen) ? 'open' : ''} group h-full flex flex-col items-center justify-center cursor-pointer gap-[6px] order-2 md:order-none`);
		$.set_attribute(div_2, 'aria-label', $.get(isExpanded) ? 'Close menu' : 'Open menu');
		$.set_style(div_2, `color:${($$props.menuColor || '#000') ?? ''};`);
		$.set_class(div_3, 1, `hamburger-line w-[30px] h-[2px] bg-current transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${$.get(isHamburgerOpen) ? 'translate-y-[4px] rotate-45' : ''} group-hover:opacity-75`);
		$.set_class(div_4, 1, `hamburger-line w-[30px] h-[2px] bg-current transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${$.get(isHamburgerOpen) ? '-translate-y-[4px] -rotate-45' : ''} group-hover:opacity-75`);
		$.set_attribute(img, 'src', $$props.logo);
		$.set_attribute(img, 'alt', logoAlt());
		$.set_style(button, `background-color:${$$props.buttonBgColor ?? ''}; color:${$$props.buttonTextColor ?? ''};`);

		$.set_class(div_6, 1, `card-nav-content absolute left-0 right-0 top-[60px] bottom-0 p-2 flex flex-col items-stretch gap-2 justify-start z-[1] ${$.get(isExpanded)
			? 'visible pointer-events-auto'
			: 'invisible pointer-events-none'} md:flex-row md:items-end md:gap-[12px]`);

		$.set_attribute(div_6, 'aria-hidden', !$.get(isExpanded));
	});

	$.delegated('click', div_2, toggleMenu);

	$.delegated('keydown', div_2, (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggleMenu();
		}
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown']);