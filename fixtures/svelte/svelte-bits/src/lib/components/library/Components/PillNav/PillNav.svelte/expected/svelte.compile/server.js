import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { gsap } from 'gsap';

export default function PillNav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			logo,
			logoAlt = 'Logo',
			items,
			activeHref,
			class: className = '',
			ease = 'power3.easeOut',
			baseColor = '#fff',
			pillColor = '#120F17',
			hoveredPillTextColor = '#120F17',
			pillTextColor,
			onMobileMenuClick,
			initialLoadAnimation = true
		} = $$props;

		const resolvedPillTextColor = $.derived(() => pillTextColor ?? baseColor);
		let isMobileMenuOpen = false;
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
							ease,
							overwrite: 'auto'
						},
						0
					);

					if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);

					if (white) {
						gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
						tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
					}

					tlRefs[index] = tl;
				});
			};

			layout();

			const onResize = () => layout();

			window.addEventListener('resize', onResize);

			if (document.fonts) document.fonts.ready.then(layout).catch(() => {});
			if (mobileMenuRef) gsap.set(mobileMenuRef, { visibility: 'hidden', opacity: 0, scaleY: 1, y: 0 });

			if (initialLoadAnimation) {
				if (logoRef) {
					gsap.set(logoRef, { scale: 0 });
					gsap.to(logoRef, { scale: 1, duration: 0.6, ease });
				}

				if (navItemsRef) {
					gsap.set(navItemsRef, { width: 0, overflow: 'hidden' });
					gsap.to(navItemsRef, { width: 'auto', duration: 0.6, ease });
				}
			}

			return () => window.removeEventListener('resize', onResize);
		});

		function handleEnter(i) {
			const tl = tlRefs[i];

			if (!tl) return;

			activeTweenRefs[i]?.kill();
			activeTweenRefs[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: 'auto' });
		}

		function handleLeave(i) {
			const tl = tlRefs[i];

			if (!tl) return;

			activeTweenRefs[i]?.kill();
			activeTweenRefs[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: 'auto' });
		}

		function handleLogoEnter() {
			if (!logoImgRef) return;

			logoTween?.kill();
			gsap.set(logoImgRef, { rotate: 0 });
			logoTween = gsap.to(logoImgRef, { rotate: 360, duration: 0.2, ease, overwrite: 'auto' });
		}

		function toggleMobileMenu() {
			const newState = !isMobileMenuOpen;

			isMobileMenuOpen = newState;

			if (hamburgerRef) {
				const lines = hamburgerRef.querySelectorAll('.hamburger-line');

				if (newState) {
					gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
					gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
				} else {
					gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
					gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
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
						ease,
						transformOrigin: 'top center'
					});
				} else {
					gsap.to(mobileMenuRef, {
						opacity: 0,
						y: 10,
						scaleY: 1,
						duration: 0.2,
						ease,
						transformOrigin: 'top center',
						onComplete: () => gsap.set(mobileMenuRef, { visibility: 'hidden' })
					});
				}
			}

			onMobileMenuClick?.();
		}

		const cssVars = $.derived(() => `--base:${baseColor};--pill-bg:${pillColor};--hover-text:${hoveredPillTextColor};--pill-text:${resolvedPillTextColor()};`);

		$$renderer.push(`<div class="pill-nav-container svelte-11v5b14"><nav${$.attr_class(`pill-nav ${$.stringify(className)}`, 'svelte-11v5b14')} aria-label="Primary"${$.attr_style(cssVars())}><a class="pill-logo"${$.attr('href', items?.[0]?.href || '#')} aria-label="Home"><img${$.attr('src', logo)}${$.attr('alt', logoAlt)}/></a> <div class="pill-nav-items desktop-only"><ul class="pill-list" role="menubar"><!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];

			$$renderer.push(`<li role="none"><a role="menuitem"${$.attr('href', item.href)}${$.attr_class(`pill ${activeHref === item.href ? 'is-active' : ''}`)}${$.attr('aria-label', item.ariaLabel || item.label)}><span class="hover-circle" aria-hidden="true"></span> <span class="label-stack"><span class="pill-label">${$.escape(item.label)}</span> <span class="pill-label-hover" aria-hidden="true">${$.escape(item.label)}</span></span></a></li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <button class="mobile-menu-button mobile-only" aria-label="Toggle menu"${$.attr('aria-expanded', isMobileMenuOpen)}><span class="hamburger-line"></span> <span class="hamburger-line"></span></button></nav> <div class="mobile-menu-popover mobile-only"${$.attr_style(cssVars())}><ul class="mobile-menu-list"><!--[-->`);

		const each_array_1 = $.ensure_array_like(items);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let item = each_array_1[$$index_1];

			$$renderer.push(`<li><a${$.attr('href', item.href)}${$.attr_class(`mobile-menu-link ${activeHref === item.href ? 'is-active' : ''}`)}>${$.escape(item.label)}</a></li>`);
		}

		$$renderer.push(`<!--]--></ul></div></div>`);
	});
}