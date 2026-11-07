import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { gsap } from 'gsap';

export default function StaggeredMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			position = 'right',
			colors = ['#FFC18A', '#FF8A4C'],
			items = [],
			socialItems = [],
			displaySocials = true,
			displayItemNumbering = true,
			class: className = '',
			logoUrl = '',
			menuButtonColor = '#fff',
			openMenuButtonColor = '#fff',
			changeMenuColorOnOpen = true,
			accentColor = '#FF8A4C',
			isFixed = false,
			closeOnClickAway = true,
			onMenuOpen,
			onMenuClose
		} = $$props;

		let open = false;
		let openRef = false;
		let textLines = ['Menu', 'Close'];
		let panelRef;
		let preLayersRef;
		let preLayerEls = [];
		let plusHRef;
		let plusVRef;
		let iconRef;
		let textInnerRef;
		let textWrapRef;
		let toggleBtnRef;
		let openTl = null;
		let closeTween = null;
		let spinTween = null;
		let textCycleAnim = null;
		let colorTween = null;
		let itemEntranceTween = null;
		let busy = false;

		const layerColors = $.derived(() => {
			const raw = colors && colors.length ? colors.slice(0, 4) : ['#1e1e22', '#35353c'];
			const arr = [...raw];

			if (arr.length >= 3) arr.splice(Math.floor(arr.length / 2), 1);

			return arr;
		});

		onMount(() => {
			const ctx = gsap.context(() => {
				if (!panelRef || !plusHRef || !plusVRef || !iconRef || !textInnerRef) return;

				preLayerEls = preLayersRef
					? Array.from(preLayersRef.querySelectorAll('.sm-prelayer'))
					: [];

				const offscreen = position === 'left' ? -100 : 100;

				gsap.set([panelRef, ...preLayerEls], { xPercent: offscreen, opacity: 1 });

				if (preLayersRef) gsap.set(preLayersRef, { xPercent: 0, opacity: 1 });

				gsap.set(plusHRef, { transformOrigin: '50% 50%', rotate: 0 });
				gsap.set(plusVRef, { transformOrigin: '50% 50%', rotate: 90 });
				gsap.set(iconRef, { rotate: 0, transformOrigin: '50% 50%' });
				gsap.set(textInnerRef, { yPercent: 0 });

				if (toggleBtnRef) gsap.set(toggleBtnRef, { color: menuButtonColor });
			});

			return () => ctx.revert();
		});

		function buildOpenTimeline() {
			if (!panelRef) return null;

			openTl?.kill();

			if (closeTween) {
				closeTween.kill();
				closeTween = null;
			}

			itemEntranceTween?.kill();

			const itemEls = Array.from(panelRef.querySelectorAll('.sm-panel-itemLabel'));
			const numberEls = Array.from(panelRef.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
			const socialTitle = panelRef.querySelector('.sm-socials-title');
			const socialLinks = Array.from(panelRef.querySelectorAll('.sm-socials-link'));
			const offscreen = position === 'left' ? -100 : 100;
			const layerStates = preLayerEls.map((el) => ({ el, start: offscreen }));
			const panelStart = offscreen;

			if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
			if (numberEls.length) gsap.set(numberEls, { '--sm-num-opacity': 0 });
			if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
			if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

			const tl = gsap.timeline({ paused: true });

			layerStates.forEach((ls, i) => {
				tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
			});

			const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
			const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
			const panelDuration = 0.65;

			tl.fromTo(panelRef, { xPercent: panelStart }, { xPercent: 0, duration: panelDuration, ease: 'power4.out' }, panelInsertTime);

			if (itemEls.length) {
				const itemsStart = panelInsertTime + panelDuration * 0.15;

				tl.to(
					itemEls,
					{
						yPercent: 0,
						rotate: 0,
						duration: 1,
						ease: 'power4.out',
						stagger: { each: 0.1, from: 'start' }
					},
					itemsStart
				);

				if (numberEls.length) {
					tl.to(
						numberEls,
						{
							duration: 0.6,
							ease: 'power2.out',
							'--sm-num-opacity': 1,
							stagger: { each: 0.08, from: 'start' }
						},
						itemsStart + 0.1
					);
				}
			}

			if (socialTitle || socialLinks.length) {
				const socialsStart = panelInsertTime + panelDuration * 0.4;

				if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: 'power2.out' }, socialsStart);

				if (socialLinks.length) {
					tl.to(
						socialLinks,
						{
							y: 0,
							opacity: 1,
							duration: 0.55,
							ease: 'power3.out',
							stagger: { each: 0.08, from: 'start' },
							onComplete: () => gsap.set(socialLinks, { clearProps: 'opacity' })
						},
						socialsStart + 0.04
					);
				}
			}

			openTl = tl;

			return tl;
		}

		function playOpen() {
			if (busy) return;

			busy = true;

			const tl = buildOpenTimeline();

			if (tl) {
				tl.eventCallback('onComplete', () => busy = false);
				tl.play(0);
			} else busy = false;
		}

		function playClose() {
			openTl?.kill();
			openTl = null;
			itemEntranceTween?.kill();

			if (!panelRef) return;

			const all = [...preLayerEls, panelRef];

			closeTween?.kill();

			const offscreen = position === 'left' ? -100 : 100;

			closeTween = gsap.to(all, {
				xPercent: offscreen,
				duration: 0.32,
				ease: 'power3.in',
				overwrite: 'auto',
				onComplete: () => {
					const itemEls = Array.from(panelRef.querySelectorAll('.sm-panel-itemLabel'));

					if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });

					const numberEls = Array.from(panelRef.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));

					if (numberEls.length) gsap.set(numberEls, { '--sm-num-opacity': 0 });

					const socialTitle = panelRef.querySelector('.sm-socials-title');
					const socialLinks = Array.from(panelRef.querySelectorAll('.sm-socials-link'));

					if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
					if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

					busy = false;
				}
			});
		}

		function animateIcon(opening) {
			if (!iconRef || !plusHRef || !plusVRef) return;

			spinTween?.kill();

			if (opening) {
				gsap.set(iconRef, { rotate: 0, transformOrigin: '50% 50%' });
				spinTween = gsap.timeline({ defaults: { ease: 'power4.out' } }).to(plusHRef, { rotate: 45, duration: 0.5 }, 0).to(plusVRef, { rotate: -45, duration: 0.5 }, 0);
			} else {
				spinTween = gsap.timeline({ defaults: { ease: 'power3.inOut' } }).to(plusHRef, { rotate: 0, duration: 0.35 }, 0).to(plusVRef, { rotate: 90, duration: 0.35 }, 0).to(iconRef, { rotate: 0, duration: 0.001 }, 0);
			}
		}

		function animateColor(opening) {
			if (!toggleBtnRef) return;

			colorTween?.kill();

			if (changeMenuColorOnOpen) {
				const target = opening ? openMenuButtonColor : menuButtonColor;

				colorTween = gsap.to(toggleBtnRef, {
					color: target,
					delay: 0.18,
					duration: 0.3,
					ease: 'power2.out'
				});
			} else gsap.set(toggleBtnRef, { color: menuButtonColor });
		}

		function animateText(opening) {
			if (!textInnerRef) return;

			textCycleAnim?.kill();

			const currentLabel = opening ? 'Menu' : 'Close';
			const targetLabel = opening ? 'Close' : 'Menu';
			const cycles = 3;
			const seq = [currentLabel];
			let last = currentLabel;

			for (let i = 0; i < cycles; i++) {
				last = last === 'Menu' ? 'Close' : 'Menu';
				seq.push(last);
			}

			if (last !== targetLabel) seq.push(targetLabel);

			seq.push(targetLabel);
			textLines = seq;
			gsap.set(textInnerRef, { yPercent: 0 });

			const lineCount = seq.length;
			const finalShift = (lineCount - 1) / lineCount * 100;

			textCycleAnim = gsap.to(textInnerRef, {
				yPercent: -finalShift,
				duration: 0.5 + lineCount * 0.07,
				ease: 'power4.out'
			});
		}

		function toggleMenu() {
			const target = !openRef;

			openRef = target;
			open = target;

			if (target) {
				onMenuOpen?.();
				playOpen();
			} else {
				onMenuClose?.();
				playClose();
			}

			animateIcon(target);
			animateColor(target);
			animateText(target);
		}

		function closeMenu() {
			if (openRef) {
				openRef = false;
				open = false;
				onMenuClose?.();
				playClose();
				animateIcon(false);
				animateColor(false);
				animateText(false);
			}
		}

		$$renderer.push(`<div${$.attr_class(`staggered-menu-wrapper ${$.stringify(className)} ${isFixed ? 'fixed-wrapper' : ''}`)}${$.attr_style(accentColor ? `--sm-accent:${accentColor};` : undefined)}${$.attr('data-position', position)}${$.attr('data-open', open || undefined)}><div class="sm-prelayers" aria-hidden="true"><!--[-->`);

		const each_array = $.ensure_array_like(layerColors());

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let c = each_array[i];

			$$renderer.push(`<div class="sm-prelayer"${$.attr_style(`background:${$.stringify(c)};`)}></div>`);
		}

		$$renderer.push(`<!--]--></div> <header class="staggered-menu-header" aria-label="Main navigation header"><div class="sm-logo" aria-label="Logo">`);

		if (logoUrl) {
			$$renderer.push(`<!--[0--><img${$.attr('src', logoUrl)} alt="Logo" class="sm-logo-img" draggable="false" width="110" height="24"/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <button class="sm-toggle"${$.attr('aria-label', open ? 'Close menu' : 'Open menu')}${$.attr('aria-expanded', open)} aria-controls="staggered-menu-panel" type="button"><span class="sm-toggle-textWrap" aria-hidden="true"><span class="sm-toggle-textInner"><!--[-->`);

		const each_array_1 = $.ensure_array_like(textLines);

		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let l = each_array_1[i];

			$$renderer.push(`<span class="sm-toggle-line">${$.escape(l)}</span>`);
		}

		$$renderer.push(`<!--]--></span></span> <span class="sm-icon" aria-hidden="true"><span class="sm-icon-line"></span> <span class="sm-icon-line sm-icon-line-v"></span></span></button></header> <aside id="staggered-menu-panel" class="staggered-menu-panel"${$.attr('aria-hidden', !open)}><div class="sm-panel-inner"><ul class="sm-panel-list" role="list"${$.attr('data-numbering', displayItemNumbering || undefined)}>`);

		if (items && items.length) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array_2 = $.ensure_array_like(items);

			for (let idx = 0, $$length = each_array_2.length; idx < $$length; idx++) {
				let it = each_array_2[idx];

				$$renderer.push(`<li class="sm-panel-itemWrap"><a class="sm-panel-item"${$.attr('href', it.link)}${$.attr('aria-label', it.ariaLabel)}${$.attr('data-index', idx + 1)}><span class="sm-panel-itemLabel">${$.escape(it.label)}</span></a></li>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><li class="sm-panel-itemWrap" aria-hidden="true"><span class="sm-panel-item"><span class="sm-panel-itemLabel">No items</span></span></li>`);
		}

		$$renderer.push(`<!--]--></ul> `);

		if (displaySocials && socialItems && socialItems.length > 0) {
			$$renderer.push(`<!--[0--><div class="sm-socials" aria-label="Social links"><h3 class="sm-socials-title">Socials</h3> <ul class="sm-socials-list" role="list"><!--[-->`);

			const each_array_3 = $.ensure_array_like(socialItems);

			for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
				let s = each_array_3[i];

				$$renderer.push(`<li class="sm-socials-item"><a${$.attr('href', s.link)} target="_blank" rel="noopener noreferrer" class="sm-socials-link">${$.escape(s.label)}</a></li>`);
			}

			$$renderer.push(`<!--]--></ul></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></aside></div>`);
	});
}