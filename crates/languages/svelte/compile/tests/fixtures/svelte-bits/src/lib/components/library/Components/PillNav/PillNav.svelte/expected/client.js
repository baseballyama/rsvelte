import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { gsap } from 'gsap';

var root = $.from_html(`<li role="none"><a role="menuitem"><span class="hover-circle" aria-hidden="true"></span> <span class="label-stack"><span class="pill-label"> </span> <span class="pill-label-hover" aria-hidden="true"> </span></span></a></li>`);
var root_1 = $.from_html(`<li><a> </a></li>`);
var root_2 = $.from_html(`<div class="pill-nav-container svelte-11v5b14"><nav aria-label="Primary"><a class="pill-logo" aria-label="Home"><img/></a> <div class="pill-nav-items desktop-only"><ul class="pill-list" role="menubar"></ul></div> <button class="mobile-menu-button mobile-only" aria-label="Toggle menu"><span class="hamburger-line"></span> <span class="hamburger-line"></span></button></nav> <div class="mobile-menu-popover mobile-only"><ul class="mobile-menu-list"></ul></div></div>`);

export default function PillNav($$anchor, $$props) {
	$.push($$props, true);

	let logoAlt = $.prop($$props, 'logoAlt', 3, 'Logo'),
		className = $.prop($$props, 'class', 3, ''),
		ease = $.prop($$props, 'ease', 3, 'power3.easeOut'),
		baseColor = $.prop($$props, 'baseColor', 3, '#fff'),
		pillColor = $.prop($$props, 'pillColor', 3, '#120F17'),
		hoveredPillTextColor = $.prop($$props, 'hoveredPillTextColor', 3, '#120F17'),
		initialLoadAnimation = $.prop($$props, 'initialLoadAnimation', 3, true);

	const resolvedPillTextColor = $.derived(() => $$props.pillTextColor ?? baseColor());
	let isMobileMenuOpen = $.state(false);
	const circleRefs = [];
	const tlRefs = [];
	const activeTweenRefs = [];
	let logoImgRef;
	let logoTween = null;
	let hamburgerRef;
	let mobileMenuRef;
	let navItemsRef;
	let logoRef;

	onMount(() => {
		const layout = () => {
			circleRefs.forEach((circle, index) => {
				if (!circle?.parentElement) return;

				const pill = circle.parentElement;
				const rect = pill.getBoundingClientRect();
				const { width: w, height: h } = rect;
				const R = (w * w / 4 + h * h) / (2 * h);
				const D = Math.ceil(2 * R) + 2;
				const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - w * w / 4))) + 1;
				const originY = D - delta;

				circle.style.width = `${D}px`;
				circle.style.height = `${D}px`;
				circle.style.bottom = `-${delta}px`;
				gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });

				const label = pill.querySelector('.pill-label');
				const white = pill.querySelector('.pill-label-hover');

				if (label) gsap.set(label, { y: 0 });
				if (white) gsap.set(white, { y: h + 12, opacity: 0 });

				tlRefs[index]?.kill();

				const tl = gsap.timeline({ paused: true });

				tl.to(
					circle,
					{
						scale: 1.2,
						xPercent: -50,
						duration: 2,
						ease: ease(),
						overwrite: 'auto'
					},
					0
				);

				if (label) tl.to(label, { y: -(h + 8), duration: 2, ease: ease(), overwrite: 'auto' }, 0);

				if (white) {
					gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });

					tl.to(
						white,
						{
							y: 0,
							opacity: 1,
							duration: 2,
							ease: ease(),
							overwrite: 'auto'
						},
						0
					);
				}

				tlRefs[index] = tl;
			});
		};

		layout();

		const onResize = () => layout();

		window.addEventListener('resize', onResize);

		if (document.fonts) document.fonts.ready.then(layout).catch(() => {});
		if (mobileMenuRef) gsap.set(mobileMenuRef, { visibility: 'hidden', opacity: 0, scaleY: 1, y: 0 });

		if (initialLoadAnimation()) {
			if (logoRef) {
				gsap.set(logoRef, { scale: 0 });
				gsap.to(logoRef, { scale: 1, duration: 0.6, ease: ease() });
			}

			if (navItemsRef) {
				gsap.set(navItemsRef, { width: 0, overflow: 'hidden' });
				gsap.to(navItemsRef, { width: 'auto', duration: 0.6, ease: ease() });
			}
		}

		return () => window.removeEventListener('resize', onResize);
	});

	function handleEnter(i) {
		const tl = tlRefs[i];

		if (!tl) return;

		activeTweenRefs[i]?.kill();
		activeTweenRefs[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease: ease(), overwrite: 'auto' });
	}

	function handleLeave(i) {
		const tl = tlRefs[i];

		if (!tl) return;

		activeTweenRefs[i]?.kill();
		activeTweenRefs[i] = tl.tweenTo(0, { duration: 0.2, ease: ease(), overwrite: 'auto' });
	}

	function handleLogoEnter() {
		if (!logoImgRef) return;

		logoTween?.kill();
		gsap.set(logoImgRef, { rotate: 0 });
		logoTween = gsap.to(logoImgRef, { rotate: 360, duration: 0.2, ease: ease(), overwrite: 'auto' });
	}

	function toggleMobileMenu() {
		const newState = !$.get(isMobileMenuOpen);

		$.set(isMobileMenuOpen, newState);

		if (hamburgerRef) {
			const lines = hamburgerRef.querySelectorAll('.hamburger-line');

			if (newState) {
				gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease: ease() });
				gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease: ease() });
			} else {
				gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease: ease() });
				gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease: ease() });
			}
		}

		if (mobileMenuRef) {
			if (newState) {
				gsap.set(mobileMenuRef, { visibility: 'visible' });

				gsap.fromTo(mobileMenuRef, { opacity: 0, y: 10, scaleY: 1 }, {
					opacity: 1,
					y: 0,
					scaleY: 1,
					duration: 0.3,
					ease: ease(),
					transformOrigin: 'top center'
				});
			} else {
				gsap.to(mobileMenuRef, {
					opacity: 0,
					y: 10,
					scaleY: 1,
					duration: 0.2,
					ease: ease(),
					transformOrigin: 'top center',
					onComplete: () => gsap.set(mobileMenuRef, { visibility: 'hidden' })
				});
			}
		}

		$$props.onMobileMenuClick?.();
	}

	const cssVars = $.derived(() => `--base:${baseColor()};--pill-bg:${pillColor()};--hover-text:${hoveredPillTextColor()};--pill-text:${$.get(resolvedPillTextColor)};`);
	var div = root_2();
	var nav = $.child(div);
	var a = $.child(nav);
	var img = $.child(a);

	$.bind_this(img, ($$value) => logoImgRef = $$value, () => logoImgRef);
	$.reset(a);
	$.bind_this(a, ($$value) => logoRef = $$value, () => logoRef);

	var div_1 = $.sibling(a, 2);
	var ul = $.child(div_1);

	$.each(ul, 23, () => $$props.items, (item) => item.href, ($$anchor, item, i) => {
		var li = root();
		var a_1 = $.child(li);
		var span = $.child(a_1);

		$.bind_this(span, ($$value, i) => circleRefs[i] = $$value, (i) => circleRefs?.[i], () => [$.get(i)]);

		var span_1 = $.sibling(span, 2);
		var span_2 = $.child(span_1);
		var text = $.only_child(span_2, true);
		var span_3 = $.sibling(span_2, 2);
		var text_1 = $.only_child(span_3, true);

		$.reset(span_1);
		$.reset(a_1);
		$.reset(li);

		$.template_effect(() => {
			$.set_attribute(a_1, 'href', $.get(item).href);
			$.set_class(a_1, 1, `pill ${$$props.activeHref === $.get(item).href ? 'is-active' : ''}`);
			$.set_attribute(a_1, 'aria-label', $.get(item).ariaLabel || $.get(item).label);
			$.set_text(text, $.get(item).label);
			$.set_text(text_1, $.get(item).label);
		});

		$.event('mouseenter', a_1, () => handleEnter($.get(i)));
		$.event('mouseleave', a_1, () => handleLeave($.get(i)));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_1);
	$.bind_this(div_1, ($$value) => navItemsRef = $$value, () => navItemsRef);

	var button = $.sibling(div_1, 2);

	$.bind_this(button, ($$value) => hamburgerRef = $$value, () => hamburgerRef);
	$.reset(nav);

	var div_2 = $.sibling(nav, 2);
	var ul_1 = $.child(div_2);

	$.each(ul_1, 21, () => $$props.items, (item) => item.href, ($$anchor, item) => {
		var li_1 = root_1();
		var a_2 = $.child(li_1);
		var text_2 = $.only_child(a_2, true);

		$.reset(li_1);

		$.template_effect(() => {
			$.set_attribute(a_2, 'href', $.get(item).href);
			$.set_class(a_2, 1, `mobile-menu-link ${$$props.activeHref === $.get(item).href ? 'is-active' : ''}`);
			$.set_text(text_2, $.get(item).label);
		});

		$.delegated('click', a_2, () => $.set(isMobileMenuOpen, false));
		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(div_2);
	$.bind_this(div_2, ($$value) => mobileMenuRef = $$value, () => mobileMenuRef);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(nav, 1, `pill-nav ${className() ?? ''}`, 'svelte-11v5b14');
		$.set_style(nav, $.get(cssVars));
		$.set_attribute(a, 'href', $$props.items?.[0]?.href || '#');
		$.set_attribute(img, 'src', $$props.logo);
		$.set_attribute(img, 'alt', logoAlt());
		$.set_attribute(button, 'aria-expanded', $.get(isMobileMenuOpen));
		$.set_style(div_2, $.get(cssVars));
	});

	$.event('mouseenter', a, handleLogoEnter);
	$.delegated('click', button, toggleMobileMenu);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);