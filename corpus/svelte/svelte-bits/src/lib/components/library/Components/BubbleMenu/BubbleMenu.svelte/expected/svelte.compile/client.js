import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { gsap } from 'gsap';

export const DEFAULT_BUBBLE_ITEMS = [
	{
		label: 'home',
		href: '#',
		ariaLabel: 'Home',
		rotation: -8,
		hoverStyles: { bgColor: '#FF8A4C', textColor: '#120F17' }
	},

	{
		label: 'about',
		href: '#',
		ariaLabel: 'About',
		rotation: 8,
		hoverStyles: { bgColor: '#FFC18A', textColor: '#120F17' }
	},

	{
		label: 'projects',
		href: '#',
		ariaLabel: 'Projects',
		rotation: 8,
		hoverStyles: { bgColor: '#FF6B2C', textColor: '#ffffff' }
	},

	{
		label: 'blog',
		href: '#',
		ariaLabel: 'Blog',
		rotation: 8,
		hoverStyles: { bgColor: '#FF8A4C', textColor: '#120F17' }
	},

	{
		label: 'contact',
		href: '#',
		ariaLabel: 'Contact',
		rotation: -8,
		hoverStyles: { bgColor: '#E86A2A', textColor: '#ffffff' }
	}
];

var root = $.from_html(`<img alt="Logo" class="bubble-logo"/>`);
var root_1 = $.from_html(`<li role="none" class="pill-col"><a role="menuitem" class="pill-link"><span class="pill-label"> </span></a></li>`);
var root_2 = $.from_html(`<div><ul class="pill-list" role="menu" aria-label="Menu links"></ul></div>`);
var root_3 = $.from_html(`<nav aria-label="Main navigation"><div class="bubble logo-bubble" aria-label="Logo"><span class="logo-content"><!></span></div> <button type="button"><span class="menu-line"></span> <span class="menu-line short"></span></button></nav> <!>`, 1);

export default function BubbleMenu($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		menuAriaLabel = $.prop($$props, 'menuAriaLabel', 3, 'Toggle menu'),
		menuBg = $.prop($$props, 'menuBg', 3, '#fff'),
		menuContentColor = $.prop($$props, 'menuContentColor', 3, '#111'),
		useFixedPosition = $.prop($$props, 'useFixedPosition', 3, false),
		animationEase = $.prop($$props, 'animationEase', 3, 'back.out(1.5)'),
		animationDuration = $.prop($$props, 'animationDuration', 3, 0.5),
		staggerDelay = $.prop($$props, 'staggerDelay', 3, 0.12);

	let isMenuOpen = $.state(false);
	let showOverlay = $.state(false);
	let overlayRef = $.state(void 0);
	const menuItems = $.derived(() => $$props.items?.length ? $$props.items : DEFAULT_BUBBLE_ITEMS);

	function handleToggle() {
		const next = !$.get(isMenuOpen);

		if (next) $.set(showOverlay, true);

		$.set(isMenuOpen, next);
		$$props.onMenuClick?.(next);
	}

	$.user_effect(() => {
		// Re-run when these change
		const open = $.get(isMenuOpen);

		const visible = $.get(showOverlay);
		const overlay = $.get(overlayRef);

		if (!overlay || !visible) return;

		// Defer one frame so {#if showOverlay} mount + bind have committed
		const id = requestAnimationFrame(() => {
			const bubbles = Array.from(overlay.querySelectorAll('.pill-link'));
			const labels = Array.from(overlay.querySelectorAll('.pill-label'));

			if (!bubbles.length) return;

			if (open) {
				gsap.set(overlay, { display: 'flex' });
				gsap.killTweensOf([...bubbles, ...labels]);
				gsap.set(bubbles, { scale: 0, transformOrigin: '50% 50%' });
				gsap.set(labels, { y: 24, autoAlpha: 0 });

				bubbles.forEach((bubble, i) => {
					const delay = i * staggerDelay() + gsap.utils.random(-0.05, 0.05);
					const tl = gsap.timeline({ delay });

					tl.to(bubble, {
						scale: 1,
						duration: animationDuration(),
						ease: animationEase()
					});

					if (labels[i]) tl.to(
						labels[i],
						{
							y: 0,
							autoAlpha: 1,
							duration: animationDuration(),
							ease: 'power3.out'
						},
						`-=${animationDuration() * 0.9}`
					);
				});
			} else {
				gsap.killTweensOf([...bubbles, ...labels]);
				gsap.to(labels, { y: 24, autoAlpha: 0, duration: 0.2, ease: 'power3.in' });

				gsap.to(bubbles, {
					scale: 0,
					duration: 0.2,
					ease: 'power3.in',
					onComplete: () => {
						gsap.set(overlay, { display: 'none' });
						$.set(showOverlay, false);
					}
				});
			}
		});

		return () => cancelAnimationFrame(id);
	});

	onMount(() => {
		const handleResize = () => {
			if (!$.get(isMenuOpen) || !$.get(overlayRef)) return;

			const isDesktop = window.innerWidth >= 900;
			const bubbles = Array.from($.get(overlayRef).querySelectorAll('.pill-link'));

			bubbles.forEach((b, i) => {
				const item = $.get(menuItems)[i];

				if (b && item) gsap.set(b, { rotation: isDesktop ? item.rotation ?? 0 : 0 });
			});
		};

		window.addEventListener('resize', handleResize);

		return () => window.removeEventListener('resize', handleResize);
	});

	var fragment = root_3();
	var nav = $.first_child(fragment);
	var div = $.child(nav);
	var span = $.child(div);
	var node = $.child(span);

	{
		var consequent = ($$anchor) => {
			var img = root();

			$.template_effect(() => $.set_attribute(img, 'src', $$props.logo));
			$.append($$anchor, img);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.logo);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (typeof $$props.logo === 'string') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(span);
	$.reset(div);

	var button = $.sibling(div, 2);
	var span_1 = $.child(button);
	var span_2 = $.sibling(span_1, 2);

	$.reset(button);
	$.reset(nav);

	var node_2 = $.sibling(nav, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root_2();
			var ul = $.child(div_1);

			$.each(ul, 21, () => $.get(menuItems), $.index, ($$anchor, item) => {
				var li = root_1();
				var a = $.child(li);
				var span_3 = $.child(a);
				var text = $.only_child(span_3, true);

				$.reset(a);
				$.reset(li);

				$.template_effect(() => {
					$.set_attribute(a, 'href', $.get(item).href);
					$.set_attribute(a, 'aria-label', $.get(item).ariaLabel || $.get(item).label);
					$.set_style(a, `--item-rot:${$.get(item).rotation ?? 0 ?? ''}deg; --pill-bg:${menuBg() ?? ''}; --pill-color:${menuContentColor() ?? ''}; --hover-bg:${($.get(item).hoverStyles?.bgColor || '#f3f4f6') ?? ''}; --hover-color:${($.get(item).hoverStyles?.textColor || menuContentColor()) ?? ''};`);
					$.set_text(text, $.get(item).label);
				});

				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(div_1);
			$.bind_this(div_1, ($$value) => $.set(overlayRef, $$value), () => $.get(overlayRef));

			$.template_effect(() => {
				$.set_class(div_1, 1, `bubble-menu-items ${useFixedPosition() ? 'fixed' : 'absolute'}`);
				$.set_attribute(div_1, 'aria-hidden', !$.get(isMenuOpen));
			});

			$.append($$anchor, div_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(showOverlay)) $$render(consequent_1);
		});
	}

	$.template_effect(() => {
		$.set_class(nav, 1, `bubble-menu ${useFixedPosition() ? 'fixed' : 'absolute'} ${className() ?? ''}`);
		$.set_style(nav, style());
		$.set_style(div, `background:${menuBg() ?? ''};`);
		$.set_class(button, 1, `bubble toggle-bubble menu-btn ${$.get(isMenuOpen) ? 'open' : ''}`);
		$.set_attribute(button, 'aria-label', menuAriaLabel());
		$.set_attribute(button, 'aria-pressed', $.get(isMenuOpen));
		$.set_style(button, `background:${menuBg() ?? ''};`);
		$.set_style(span_1, `background:${menuContentColor() ?? ''};`);
		$.set_style(span_2, `background:${menuContentColor() ?? ''};`);
	});

	$.delegated('click', button, handleToggle);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);