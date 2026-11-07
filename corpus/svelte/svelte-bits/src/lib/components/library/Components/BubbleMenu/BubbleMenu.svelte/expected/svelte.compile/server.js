import * as $ from 'svelte/internal/server';
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

export default function BubbleMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			logo,
			onMenuClick,
			class: className = '',
			style = '',
			menuAriaLabel = 'Toggle menu',
			menuBg = '#fff',
			menuContentColor = '#111',
			useFixedPosition = false,
			items,
			animationEase = 'back.out(1.5)',
			animationDuration = 0.5,
			staggerDelay = 0.12
		} = $$props;

		let isMenuOpen = false;
		let showOverlay = false;
		let overlayRef = void 0;
		const menuItems = $.derived(() => items?.length ? items : DEFAULT_BUBBLE_ITEMS);

		function handleToggle() {
			const next = !isMenuOpen;

			if (next) showOverlay = true;

			isMenuOpen = next;
			onMenuClick?.(next);
		}

		// Re-run when these change
		// Defer one frame so {#if showOverlay} mount + bind have committed
		onMount(() => {
			const handleResize = () => {
				if (!isMenuOpen || !overlayRef) return;

				const isDesktop = window.innerWidth >= 900;
				const bubbles = Array.from(overlayRef.querySelectorAll('.pill-link'));

				bubbles.forEach((b, i) => {
					const item = menuItems()[i];

					if (b && item) gsap.set(b, { rotation: isDesktop ? item.rotation ?? 0 : 0 });
				});
			};

			window.addEventListener('resize', handleResize);

			return () => window.removeEventListener('resize', handleResize);
		});

		$$renderer.push(`<nav${$.attr_class(`bubble-menu ${useFixedPosition ? 'fixed' : 'absolute'} ${$.stringify(className)}`)}${$.attr_style(style)} aria-label="Main navigation"><div class="bubble logo-bubble" aria-label="Logo"${$.attr_style(`background:${$.stringify(menuBg)};`)}><span class="logo-content">`);

		if (typeof logo === 'string') {
			$$renderer.push(`<!--[0--><img${$.attr('src', logo)} alt="Logo" class="bubble-logo"/>`);
		} else {
			$$renderer.push('<!--[-1-->');
			logo($$renderer);
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]--></span></div> <button type="button"${$.attr_class(`bubble toggle-bubble menu-btn ${isMenuOpen ? 'open' : ''}`)}${$.attr('aria-label', menuAriaLabel)}${$.attr('aria-pressed', isMenuOpen)}${$.attr_style(`background:${$.stringify(menuBg)};`)}><span class="menu-line"${$.attr_style(`background:${$.stringify(menuContentColor)};`)}></span> <span class="menu-line short"${$.attr_style(`background:${$.stringify(menuContentColor)};`)}></span></button></nav> `);

		if (showOverlay) {
			$$renderer.push(`<!--[0--><div${$.attr_class(`bubble-menu-items ${useFixedPosition ? 'fixed' : 'absolute'}`)}${$.attr('aria-hidden', !isMenuOpen)}><ul class="pill-list" role="menu" aria-label="Menu links"><!--[-->`);

			const each_array = $.ensure_array_like(menuItems());

			for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
				let item = each_array[idx];

				$$renderer.push(`<li role="none" class="pill-col"><a role="menuitem"${$.attr('href', item.href)}${$.attr('aria-label', item.ariaLabel || item.label)} class="pill-link"${$.attr_style(`--item-rot:${$.stringify(item.rotation ?? 0)}deg; --pill-bg:${$.stringify(menuBg)}; --pill-color:${$.stringify(menuContentColor)}; --hover-bg:${$.stringify(item.hoverStyles?.bgColor || '#f3f4f6')}; --hover-color:${$.stringify(item.hoverStyles?.textColor || menuContentColor)};`)}><span class="pill-label">${$.escape(item.label)}</span></a></li>`);
			}

			$$renderer.push(`<!--]--></ul></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}