import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { page } from '$app/state';
import { getImageCDNUrl } from '@misiki/kitcommerce-core/utils';

export default function Lazy_img_with_zoom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: klass,
			alt = '',
			height = 'auto',
			src = '',
			aspectRatio = page?.data?.store?.productImageAspectRatio,
			width = 'auto',
			priority = false,
			$$slots,
			$$events,
			...rest
		} = $$props;

		// Fallback CDN resize width for responsive (w-full) images that pass no explicit
		// width. Without it the CDN URL omits width=/height= and serves the full-res original.
		// Larger than lazy-img's default because the zoom panel magnifies up to 2.5x.
		const DEFAULT_CDN_WIDTH = 1600;

		// Magnification used by the side zoom panel.
		const ZOOM = 2.5;

		// The panel needs far more detail than the on-page image, so it asks the CDN for a
		// high-resolution copy of the same admin/API image (or the untouched original when the
		// CDN plugin is off) instead of magnifying the display-sized copy.
		const ZOOM_CDN_WIDTH = 2400;

		// Gap between the image and the zoom panel.
		const PANEL_GAP = 16;

		// Below this the panel is too cramped to be useful, so zoom is skipped entirely.
		const MIN_PANEL_WIDTH = 280;

		// Keep the panel off the very edge of the viewport.
		const VIEWPORT_INSET = 8;

		const h = $.derived(() => height === 'auto' ? '0' : +height * 2);
		const w = $.derived(() => width === 'auto' ? '0' : +width * 2);

		// Width fed to the CDN URL builder: real width when given, else the fallback.
		const cdnW = $.derived(() => width === 'auto' ? DEFAULT_CDN_WIDTH : +width * 2);

		const $$d = $.derived(() => aspectRatio?.split(':') || ['1', '1']),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			aspectWidth = $.derived(() => $$derived_array()[0]),
			aspectHeight = $.derived(() => $$derived_array()[1]);

		const extension = $.derived(() => src?.split('.').pop());
		let isSvg = false;
		let loaded = false;
		let error = false;
		let isIntersecting = false;
		let containerRef = void 0;
		let usingFallback = false; // Track if we're using fallback

		// Zoom state
		let isHovered = false;

		let isMobile = false;

		// Image box measured on hover; the lens/panel maths are relative to it.
		let box = null;

		// Lens rectangle, in image-box pixels.
		let lens = { left: 0, top: 0, width: 0, height: 0 };

		// Zoom panel rectangle, in viewport pixels.
		let panel = null;

		// Whether the high-definition copy has arrived; until then the panel shows the display copy.
		let zoomHiResLoaded = false;

		if (extension() === 'svg') {
			isSvg = true;
		}

		const cdnActive = $.derived(() => page?.data?.store?.plugins?.imageCdn?.active && !usingFallback);

		// Display-sized copy: already in cache, so the panel has something sharp-enough to show instantly.
		const displaySrc = $.derived(() => cdnActive() ? getImageCDNUrl(src, cdnW(), h()) : src);

		// High-definition copy, fetched only once the shopper actually hovers.
		const zoomSrc = $.derived(() => cdnActive() ? getImageCDNUrl(src, ZOOM_CDN_WIDTH, '0') : src);

		const canZoom = $.derived(() => !isMobile && !isSvg && !error && (loaded || priority));
		const showZoom = $.derived(() => isHovered && canZoom() && !!box && !!panel);

		// Transparent placeholder
		const transparentPlaceholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

		let observer;

		onMount(() => {
			isMobile = window.innerWidth < 640;

			const handleResize = () => {
				isMobile = window.innerWidth < 640;
				closeZoom();
			};

			window.addEventListener('resize', handleResize);

			// Scrolling invalidates the cached image box, so drop the zoom instead of drifting.
			window.addEventListener('scroll', closeZoom, true);

			observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (!isIntersecting) {
							isIntersecting = entry.isIntersecting;
						}
					}
				},
				{ rootMargin: '50px', threshold: 0 }
			);

			if (containerRef) {
				observer.observe(containerRef);
			}

			return () => {
				if (observer) {
					observer.disconnect();
				}

				window.removeEventListener('resize', handleResize);
				window.removeEventListener('scroll', closeZoom, true);
			};
		});

		const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

		// Places the panel beside the image: right by default, left when the right side is too tight.
		function computePanel(rect) {
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			const spaceRight = viewportWidth - rect.right - PANEL_GAP - VIEWPORT_INSET;
			const spaceLeft = rect.left - PANEL_GAP - VIEWPORT_INSET;
			let panelWidth;
			let left;

			if (spaceRight >= MIN_PANEL_WIDTH) {
				panelWidth = Math.min(rect.width, spaceRight);
				left = rect.right + PANEL_GAP;
			} else if (spaceLeft >= MIN_PANEL_WIDTH) {
				panelWidth = Math.min(rect.width, spaceLeft);
				left = rect.left - PANEL_GAP - panelWidth;
			} else {
				return null;
			}

			const panelHeight = Math.min(rect.height, viewportHeight - VIEWPORT_INSET * 2);
			const top = clamp(rect.top, VIEWPORT_INSET, Math.max(VIEWPORT_INSET, viewportHeight - VIEWPORT_INSET - panelHeight));

			return { left, top, width: panelWidth, height: panelHeight };
		}

		// The lens is the slice of the image the panel shows, so it is the panel scaled down by ZOOM.
		function updateLens(e) {
			if (!box || !panel) return;

			const lensWidth = Math.min(panel.width / ZOOM, box.width);
			const lensHeight = Math.min(panel.height / ZOOM, box.height);

			lens = {
				left: clamp(e.clientX - box.left - lensWidth / 2, 0, box.width - lensWidth),
				top: clamp(e.clientY - box.top - lensHeight / 2, 0, box.height - lensHeight),
				width: lensWidth,
				height: lensHeight
			};
		}

		function openZoom(e) {
			if (!containerRef || !canZoom()) return;

			const rect = containerRef.getBoundingClientRect();
			const nextPanel = computePanel(rect);

			if (!nextPanel) {
				closeZoom();

				return;
			}

			box = {
				left: rect.left,
				top: rect.top,
				width: rect.width,
				height: rect.height
			};

			panel = nextPanel;
			updateLens(e);
			isHovered = true;
		}

		function handleMouseMove(e) {
			if (isMobile) return;

			if (isHovered) {
				updateLens(e);
			} else {
				openZoom(e);
			}
		}

		function closeZoom() {
			isHovered = false;
		}

		// The panel has to escape the carousel's overflow-hidden/transformed viewport.
		function portal(node) {
			document.body.appendChild(node);

			return {
				destroy() {
					node.remove();
				}
			};
		}

		$$renderer.push(`<div class="relative w-full overflow-hidden bg-gray-50 svelte-v7i00l"${$.attr_style(`aspect-ratio: ${$.stringify(aspectWidth())}/${$.stringify(aspectHeight())}; ${height !== 'auto' ? `height: ${height}px;` : ''} ${width !== 'auto' ? `width: ${width}px;` : ''}`)}>`);

		if ((!loaded || error) && !priority) {
			$$renderer.push(`<!--[0--><div class="absolute inset-0 flex items-center justify-center bg-gray-50 animate-pulse svelte-v7i00l"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (page?.data?.store?.plugins?.imageCdn?.active && !usingFallback) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(klass), 'svelte-v7i00l')}>`);

			if (isIntersecting || priority) {
				$$renderer.push(`<!--[0--><img${$.attributes(
					{
						alt,
						draggable: 'false',
						fetchpriority: priority ? 'high' : 'auto',
						decoding: 'async',
						'data-nimg': '1',
						loading: priority ? 'eager' : 'lazy',
						src: getImageCDNUrl(src, cdnW(), h()),
						height: +h(),
						width: +w(),
						class: `h-full w-full object-contain object-center ${$.stringify(klass)}`,
						...rest
					},
					'svelte-v7i00l',
					{
						'opacity-0': !(loaded || priority),
						'opacity-100': loaded || priority
					}
				)} onload="this.__e=event" onerror="this.__e=event"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(klass), 'svelte-v7i00l')}${$.attr_style(`width: ${$.stringify(width)}px; height: ${$.stringify(height)}px;`)}>`);

			if (isIntersecting || priority) {
				$$renderer.push(`<!--[0--><img${$.attributes(
					{
						alt,
						src,
						draggable: 'false',
						loading: priority ? 'eager' : 'lazy',
						fetchpriority: priority ? 'high' : 'auto',
						decoding: 'async',
						'data-nimg': '1',
						height: +h(),
						width: +w(),
						class: `h-full w-full object-contain object-center ${$.stringify(klass)}`,
						...rest
					},
					'svelte-v7i00l',
					{
						'opacity-0': !(loaded || priority),
						'opacity-100': loaded || priority
					}
				)} onload="this.__e=event" onerror="this.__e=event"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--> `);

		if (showZoom()) {
			$$renderer.push(`<!--[0--><div class="pointer-events-none absolute z-10 border border-border bg-foreground/10 svelte-v7i00l"${$.attr_style(`left: ${$.stringify(lens.left)}px; top: ${$.stringify(lens.top)}px; width: ${$.stringify(lens.width)}px; height: ${$.stringify(lens.height)}px;`)} aria-hidden="true"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (showZoom() && box && panel) {
			$$renderer.push('<!--[0-->');

			const frame = `width: ${box.width * ZOOM}px; height: ${box.height * ZOOM}px; left: ${-lens.left * ZOOM}px; top: ${-lens.top * ZOOM}px;`;

			$$renderer.push(`<div class="pointer-events-none fixed z-[80] overflow-hidden rounded-radius border border-border bg-background shadow-xl svelte-v7i00l"${$.attr_style(`left: ${$.stringify(panel.left)}px; top: ${$.stringify(panel.top)}px; width: ${$.stringify(panel.width)}px; height: ${$.stringify(panel.height)}px;`)} aria-hidden="true"><img${$.attr('src', displaySrc())} alt="" draggable="false" decoding="async" class="absolute max-w-none object-contain object-center svelte-v7i00l"${$.attr_style(frame)}/> <img${$.attr('src', zoomSrc())} alt="" draggable="false" decoding="async"${$.attr_class('absolute max-w-none object-contain object-center transition-opacity duration-200 svelte-v7i00l', void 0, { 'opacity-0': !zoomHiResLoaded })}${$.attr_style(frame)} onload="this.__e=event"/></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}