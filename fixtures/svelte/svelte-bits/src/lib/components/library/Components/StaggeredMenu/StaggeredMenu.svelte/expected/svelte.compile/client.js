import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { gsap } from 'gsap';

var root = $.from_html(`<div class="sm-prelayer"></div>`);
var root_1 = $.from_html(`<img alt="Logo" class="sm-logo-img" draggable="false" width="110" height="24"/>`);
var root_2 = $.from_html(`<span class="sm-toggle-line"> </span>`);
var root_3 = $.from_html(`<li class="sm-panel-itemWrap"><a class="sm-panel-item"><span class="sm-panel-itemLabel"> </span></a></li>`);
var root_4 = $.from_html(`<li class="sm-panel-itemWrap" aria-hidden="true"><span class="sm-panel-item"><span class="sm-panel-itemLabel">No items</span></span></li>`);
var root_5 = $.from_html(`<li class="sm-socials-item"><a target="_blank" rel="noopener noreferrer" class="sm-socials-link"> </a></li>`);
var root_6 = $.from_html(`<div class="sm-socials" aria-label="Social links"><h3 class="sm-socials-title">Socials</h3> <ul class="sm-socials-list" role="list"></ul></div>`);
var root_7 = $.from_html(`<div><div class="sm-prelayers" aria-hidden="true"></div> <header class="staggered-menu-header" aria-label="Main navigation header"><div class="sm-logo" aria-label="Logo"><!></div> <button class="sm-toggle" aria-controls="staggered-menu-panel" type="button"><span class="sm-toggle-textWrap" aria-hidden="true"><span class="sm-toggle-textInner"></span></span> <span class="sm-icon" aria-hidden="true"><span class="sm-icon-line"></span> <span class="sm-icon-line sm-icon-line-v"></span></span></button></header> <aside id="staggered-menu-panel" class="staggered-menu-panel"><div class="sm-panel-inner"><ul class="sm-panel-list" role="list"><!></ul> <!></div></aside></div>`);

export default function StaggeredMenu($$anchor, $$props) {
	$.push($$props, true);

	let position = $.prop($$props, 'position', 3, 'right'),
		colors = $.prop($$props, 'colors', 19, () => ['#FFC18A', '#FF8A4C']),
		items = $.prop($$props, 'items', 19, () => []),
		socialItems = $.prop($$props, 'socialItems', 19, () => []),
		displaySocials = $.prop($$props, 'displaySocials', 3, true),
		displayItemNumbering = $.prop($$props, 'displayItemNumbering', 3, true),
		className = $.prop($$props, 'class', 3, ''),
		logoUrl = $.prop($$props, 'logoUrl', 3, ''),
		menuButtonColor = $.prop($$props, 'menuButtonColor', 3, '#fff'),
		openMenuButtonColor = $.prop($$props, 'openMenuButtonColor', 3, '#fff'),
		changeMenuColorOnOpen = $.prop($$props, 'changeMenuColorOnOpen', 3, true),
		accentColor = $.prop($$props, 'accentColor', 3, '#FF8A4C'),
		isFixed = $.prop($$props, 'isFixed', 3, false),
		closeOnClickAway = $.prop($$props, 'closeOnClickAway', 3, true);

	let open = $.state(false);
	let openRef = false;
	let textLines = $.state($.proxy(['Menu', 'Close']));
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
		const raw = colors() && colors().length ? colors().slice(0, 4) : ['#1e1e22', '#35353c'];
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

			const offscreen = position() === 'left' ? -100 : 100;

			gsap.set([panelRef, ...preLayerEls], { xPercent: offscreen, opacity: 1 });

			if (preLayersRef) gsap.set(preLayersRef, { xPercent: 0, opacity: 1 });

			gsap.set(plusHRef, { transformOrigin: '50% 50%', rotate: 0 });
			gsap.set(plusVRef, { transformOrigin: '50% 50%', rotate: 90 });
			gsap.set(iconRef, { rotate: 0, transformOrigin: '50% 50%' });
			gsap.set(textInnerRef, { yPercent: 0 });

			if (toggleBtnRef) gsap.set(toggleBtnRef, { color: menuButtonColor() });
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
		const offscreen = position() === 'left' ? -100 : 100;
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

		const offscreen = position() === 'left' ? -100 : 100;

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

		if (changeMenuColorOnOpen()) {
			const target = opening ? openMenuButtonColor() : menuButtonColor();

			colorTween = gsap.to(toggleBtnRef, {
				color: target,
				delay: 0.18,
				duration: 0.3,
				ease: 'power2.out'
			});
		} else gsap.set(toggleBtnRef, { color: menuButtonColor() });
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
		$.set(textLines, seq, true);
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
		$.set(open, target);

		if (target) {
			$$props.onMenuOpen?.();
			playOpen();
		} else {
			$$props.onMenuClose?.();
			playClose();
		}

		animateIcon(target);
		animateColor(target);
		animateText(target);
	}

	function closeMenu() {
		if (openRef) {
			openRef = false;
			$.set(open, false);
			$$props.onMenuClose?.();
			playClose();
			animateIcon(false);
			animateColor(false);
			animateText(false);
		}
	}

	$.user_effect(() => {
		if (!closeOnClickAway() || !$.get(open)) return;

		const onMouseDown = (e) => {
			if (panelRef && !panelRef.contains(e.target) && toggleBtnRef && !toggleBtnRef.contains(e.target)) {
				closeMenu();
			}
		};

		document.addEventListener('mousedown', onMouseDown);

		return () => document.removeEventListener('mousedown', onMouseDown);
	});

	var div = root_7();
	var div_1 = $.child(div);

	$.each(div_1, 21, () => $.get(layerColors), $.index, ($$anchor, c) => {
		var div_2 = root();

		$.template_effect(() => $.set_style(div_2, `background:${$.get(c) ?? ''};`));
		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => preLayersRef = $$value, () => preLayersRef);

	var header = $.sibling(div_1, 2);
	var div_3 = $.child(header);
	var node = $.child(div_3);

	{
		var consequent = ($$anchor) => {
			var img = root_1();

			$.template_effect(() => $.set_attribute(img, 'src', logoUrl()));
			$.append($$anchor, img);
		};

		$.if(node, ($$render) => {
			if (logoUrl()) $$render(consequent);
		});
	}

	$.reset(div_3);

	var button = $.sibling(div_3, 2);
	var span = $.child(button);
	var span_1 = $.child(span);

	$.each(span_1, 21, () => $.get(textLines), $.index, ($$anchor, l) => {
		var span_2 = root_2();
		var text = $.only_child(span_2, true);

		$.template_effect(() => $.set_text(text, $.get(l)));
		$.append($$anchor, span_2);
	});

	$.reset(span_1);
	$.bind_this(span_1, ($$value) => textInnerRef = $$value, () => textInnerRef);
	$.reset(span);
	$.bind_this(span, ($$value) => textWrapRef = $$value, () => textWrapRef);

	var span_3 = $.sibling(span, 2);
	var span_4 = $.child(span_3);

	$.bind_this(span_4, ($$value) => plusHRef = $$value, () => plusHRef);

	var span_5 = $.sibling(span_4, 2);

	$.bind_this(span_5, ($$value) => plusVRef = $$value, () => plusVRef);
	$.reset(span_3);
	$.bind_this(span_3, ($$value) => iconRef = $$value, () => iconRef);
	$.reset(button);
	$.bind_this(button, ($$value) => toggleBtnRef = $$value, () => toggleBtnRef);
	$.reset(header);

	var aside = $.sibling(header, 2);
	var div_4 = $.child(aside);
	var ul = $.child(div_4);
	var node_1 = $.child(ul);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.each(node_2, 19, items, (it, idx) => it.label + idx, ($$anchor, it, idx) => {
				var li = root_3();
				var a = $.child(li);
				var span_6 = $.child(a);
				var text_1 = $.only_child(span_6, true);

				$.reset(a);
				$.reset(li);

				$.template_effect(() => {
					$.set_attribute(a, 'href', $.get(it).link);
					$.set_attribute(a, 'aria-label', $.get(it).ariaLabel);
					$.set_attribute(a, 'data-index', $.get(idx) + 1);
					$.set_text(text_1, $.get(it).label);
				});

				$.append($$anchor, li);
			});

			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var li_1 = root_4();

			$.append($$anchor, li_1);
		};

		$.if(node_1, ($$render) => {
			if (items() && items().length) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(ul);

	var node_3 = $.sibling(ul, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_5 = root_6();
			var ul_1 = $.sibling($.child(div_5), 2);

			$.each(ul_1, 23, socialItems, (s, i) => s.label + i, ($$anchor, s) => {
				var li_2 = root_5();
				var a_1 = $.child(li_2);
				var text_2 = $.only_child(a_1, true);

				$.reset(li_2);

				$.template_effect(() => {
					$.set_attribute(a_1, 'href', $.get(s).link);
					$.set_text(text_2, $.get(s).label);
				});

				$.append($$anchor, li_2);
			});

			$.reset(ul_1);
			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		$.if(node_3, ($$render) => {
			if (displaySocials() && socialItems() && socialItems().length > 0) $$render(consequent_2);
		});
	}

	$.reset(div_4);
	$.reset(aside);
	$.bind_this(aside, ($$value) => panelRef = $$value, () => panelRef);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `staggered-menu-wrapper ${className() ?? ''} ${isFixed() ? 'fixed-wrapper' : ''}`);
		$.set_style(div, accentColor() ? `--sm-accent:${accentColor()};` : undefined);
		$.set_attribute(div, 'data-position', position());
		$.set_attribute(div, 'data-open', $.get(open) || undefined);
		$.set_attribute(button, 'aria-label', $.get(open) ? 'Close menu' : 'Open menu');
		$.set_attribute(button, 'aria-expanded', $.get(open));
		$.set_attribute(aside, 'aria-hidden', !$.get(open));
		$.set_attribute(ul, 'data-numbering', displayItemNumbering() || undefined);
	});

	$.delegated('click', button, toggleMenu);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);