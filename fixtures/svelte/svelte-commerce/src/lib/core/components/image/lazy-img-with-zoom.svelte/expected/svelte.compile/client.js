import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { page } from '$app/state';
import { getImageCDNUrl } from '@misiki/kitcommerce-core/utils';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'alt',
	'height',
	'src',
	'aspectRatio',
	'width',
	'priority'
]);

var root = $.from_html(`<div class="absolute inset-0 flex items-center justify-center bg-gray-50 animate-pulse svelte-v7i00l"></div>`);
var root_1 = $.from_html(`<img/>`);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<div class="pointer-events-none absolute z-10 border border-border bg-foreground/10 svelte-v7i00l" aria-hidden="true"></div>`);
var root_4 = $.from_html(`<div class="pointer-events-none fixed z-[80] overflow-hidden rounded-radius border border-border bg-background shadow-xl svelte-v7i00l" aria-hidden="true"><img alt="" draggable="false" decoding="async" class="absolute max-w-none object-contain object-center svelte-v7i00l"/> <img alt="" draggable="false" decoding="async"/></div>`);
var root_5 = $.from_html(`<div class="relative w-full overflow-hidden bg-gray-50 svelte-v7i00l"><!> <!> <!></div> <!>`, 1);

export default function Lazy_img_with_zoom($$anchor, $$props) {
	$.push($$props, true);

	let alt = $.prop($$props, 'alt', 3, ''),
		height = $.prop($$props, 'height', 3, 'auto'),
		src = $.prop($$props, 'src', 3, ''),
		aspectRatio = $.prop($$props, 'aspectRatio', 19, () => page?.data?.store?.productImageAspectRatio),
		width = $.prop($$props, 'width', 3, 'auto'),
		priority = $.prop($$props, 'priority', 3, false),
		rest = $.rest_props($$props, rest_excludes);

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

	const h = $.derived(() => height() === 'auto' ? '0' : +height() * 2);
	const w = $.derived(() => width() === 'auto' ? '0' : +width() * 2);

	// Width fed to the CDN URL builder: real width when given, else the fallback.
	const cdnW = $.derived(() => width() === 'auto' ? DEFAULT_CDN_WIDTH : +width() * 2);

	const $$d = $.derived(() => aspectRatio()?.split(':') || ['1', '1']),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		aspectWidth = $.derived(() => $.get($$array)[0]),
		aspectHeight = $.derived(() => $.get($$array)[1]);

	const extension = $.derived(() => src()?.split('.').pop());
	let isSvg = $.state(false);
	let loaded = $.state(false);
	let error = $.state(false);
	let isIntersecting = $.state(false);
	let containerRef = $.state(void 0);
	let usingFallback = $.state(false // Track if we're using fallback
	);

	// Zoom state
	let isHovered = $.state(false);

	let isMobile = $.state(false);

	// Image box measured on hover; the lens/panel maths are relative to it.
	let box = $.state(null);

	// Lens rectangle, in image-box pixels.
	let lens = $.state($.proxy({ left: 0, top: 0, width: 0, height: 0 }));

	// Zoom panel rectangle, in viewport pixels.
	let panel = $.state(null);

	// Whether the high-definition copy has arrived; until then the panel shows the display copy.
	let zoomHiResLoaded = $.state(false);

	if ($.get(extension) === 'svg') {
		$.set(isSvg, true);
	}

	const cdnActive = $.derived(() => page?.data?.store?.plugins?.imageCdn?.active && !$.get(usingFallback));

	// Display-sized copy: already in cache, so the panel has something sharp-enough to show instantly.
	const displaySrc = $.derived(() => $.get(cdnActive) ? getImageCDNUrl(src(), $.get(cdnW), $.get(h)) : src());

	// High-definition copy, fetched only once the shopper actually hovers.
	const zoomSrc = $.derived(() => $.get(cdnActive) ? getImageCDNUrl(src(), ZOOM_CDN_WIDTH, '0') : src());

	const canZoom = $.derived(() => !$.get(isMobile) && !$.get(isSvg) && !$.get(error) && ($.get(loaded) || priority()));
	const showZoom = $.derived(() => $.get(isHovered) && $.get(canZoom) && !!$.get(box) && !!$.get(panel));

	// Transparent placeholder
	const transparentPlaceholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

	let observer;

	onMount(() => {
		$.set(isMobile, window.innerWidth < 640);

		const handleResize = () => {
			$.set(isMobile, window.innerWidth < 640);
			closeZoom();
		};

		window.addEventListener('resize', handleResize);

		// Scrolling invalidates the cached image box, so drop the zoom instead of drifting.
		window.addEventListener('scroll', closeZoom, true);

		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!$.get(isIntersecting)) {
						$.set(isIntersecting, entry.isIntersecting, true);
					}
				}
			},
			{ rootMargin: '50px', threshold: 0 }
		);

		if ($.get(containerRef)) {
			observer.observe($.get(containerRef));
		}

		return () => {
			if (observer) {
				observer.disconnect();
			}

			window.removeEventListener('resize', handleResize);
			window.removeEventListener('scroll', closeZoom, true);
		};
	});

	$.user_effect(() => {
		if (src()) {
			$.set(loaded, false);
			$.set(error, false);
			$.set(usingFallback, false);
			$.set(zoomHiResLoaded, false);
		}
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
		if (!$.get(box) || !$.get(panel)) return;

		const lensWidth = Math.min($.get(panel).width / ZOOM, $.get(box).width);
		const lensHeight = Math.min($.get(panel).height / ZOOM, $.get(box).height);

		$.set(
			lens,
			{
				left: clamp(e.clientX - $.get(box).left - lensWidth / 2, 0, $.get(box).width - lensWidth),
				top: clamp(e.clientY - $.get(box).top - lensHeight / 2, 0, $.get(box).height - lensHeight),
				width: lensWidth,
				height: lensHeight
			},
			true
		);
	}

	function openZoom(e) {
		if (!$.get(containerRef) || !$.get(canZoom)) return;

		const rect = $.get(containerRef).getBoundingClientRect();
		const nextPanel = computePanel(rect);

		if (!nextPanel) {
			closeZoom();

			return;
		}

		$.set(
			box,
			{
				left: rect.left,
				top: rect.top,
				width: rect.width,
				height: rect.height
			},
			true
		);

		$.set(panel, nextPanel, true);
		updateLens(e);
		$.set(isHovered, true);
	}

	function handleMouseMove(e) {
		if ($.get(isMobile)) return;

		if ($.get(isHovered)) {
			updateLens(e);
		} else {
			openZoom(e);
		}
	}

	function closeZoom() {
		$.set(isHovered, false);
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

	var fragment = root_5();
	var div = $.first_child(fragment);
	var node_1 = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();

			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if ((!$.get(loaded) || $.get(error)) && !priority()) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_2 = root_2();
			var node_3 = $.child(div_2);

			{
				var consequent_1 = ($$anchor) => {
					var img = root_1();

					var event_handler = () => {
						$.set(loaded, true);
						$.set(error, false);
					};

					var event_handler_1 = (e) => {
						if (!$.get(usingFallback)) {
							$.set(usingFallback, true);
							$.set(loaded, false);
							$.set(error, false);
						} else {
							$.set(error, true);
							$.set(loaded, false);
						}
					};

					$.attribute_effect(
						img,
						($0) => ({
							onload: event_handler,
							onerror: event_handler_1,
							alt: alt(),
							draggable: 'false',
							fetchpriority: priority() ? 'high' : 'auto',
							decoding: 'async',
							'data-nimg': '1',
							loading: priority() ? 'eager' : 'lazy',
							src: $0,
							height: +$.get(h),
							width: +$.get(w),
							class: `h-full w-full object-contain object-center ${$$props.class ?? ''}`,
							...rest,
							[$.CLASS]: {
								'opacity-0': !($.get(loaded) || priority()),
								'opacity-100': $.get(loaded) || priority()
							}
						}),
						[() => getImageCDNUrl(src(), $.get(cdnW), $.get(h))],
						void 0,
						void 0,
						'svelte-v7i00l'
					);

					$.replay_events(img);
					$.append($$anchor, img);
				};

				$.if(node_3, ($$render) => {
					if ($.get(isIntersecting) || priority()) $$render(consequent_1);
				});
			}

			$.reset(div_2);
			$.template_effect(() => $.set_class(div_2, 1, $.clsx($$props.class), 'svelte-v7i00l'));
			$.append($$anchor, div_2);
		};

		var alternate = ($$anchor) => {
			var div_3 = root_2();
			var node_4 = $.child(div_3);

			{
				var consequent_3 = ($$anchor) => {
					var img_1 = root_1();

					var event_handler_2 = () => {
						$.set(loaded, true);
						$.set(error, false);
					};

					var event_handler_3 = (ev) => {
						$.set(error, true);
						$.set(loaded, false);
					};

					$.attribute_effect(
						img_1,
						() => ({
							onload: event_handler_2,
							onerror: event_handler_3,
							alt: alt(),
							src: src(),
							draggable: 'false',
							loading: priority() ? 'eager' : 'lazy',
							fetchpriority: priority() ? 'high' : 'auto',
							decoding: 'async',
							'data-nimg': '1',
							height: +$.get(h),
							width: +$.get(w),
							class: `h-full w-full object-contain object-center ${$$props.class ?? ''}`,
							...rest,
							[$.CLASS]: {
								'opacity-0': !($.get(loaded) || priority()),
								'opacity-100': $.get(loaded) || priority()
							}
						}),
						void 0,
						void 0,
						void 0,
						'svelte-v7i00l'
					);

					$.replay_events(img_1);
					$.append($$anchor, img_1);
				};

				$.if(node_4, ($$render) => {
					if ($.get(isIntersecting) || priority()) $$render(consequent_3);
				});
			}

			$.reset(div_3);

			$.template_effect(() => {
				$.set_class(div_3, 1, $.clsx($$props.class), 'svelte-v7i00l');
				$.set_style(div_3, `width: ${width() ?? ''}px; height: ${height() ?? ''}px;`);
			});

			$.append($$anchor, div_3);
		};

		$.if(node_2, ($$render) => {
			if (page?.data?.store?.plugins?.imageCdn?.active && !$.get(usingFallback)) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	var node_5 = $.sibling(node_2, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_4 = root_3();

			$.template_effect(() => $.set_style(div_4, `left: ${$.get(lens).left ?? ''}px; top: ${$.get(lens).top ?? ''}px; width: ${$.get(lens).width ?? ''}px; height: ${$.get(lens).height ?? ''}px;`));
			$.append($$anchor, div_4);
		};

		$.if(node_5, ($$render) => {
			if ($.get(showZoom)) $$render(consequent_4);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(containerRef, $$value), () => $.get(containerRef));

	var node_6 = $.sibling(div, 2);

	{
		var consequent_5 = ($$anchor) => {
			const frame = $.derived(() => `width: ${$.get(box).width * ZOOM}px; height: ${$.get(box).height * ZOOM}px; left: ${-$.get(lens).left * ZOOM}px; top: ${-$.get(lens).top * ZOOM}px;`);
			var div_5 = root_4();
			var img_2 = $.child(div_5);
			var img_3 = $.sibling(img_2, 2);
			let classes;

			$.reset(div_5);
			$.action(div_5, ($$node) => portal?.($$node));

			$.template_effect(() => {
				$.set_style(div_5, `left: ${$.get(panel).left ?? ''}px; top: ${$.get(panel).top ?? ''}px; width: ${$.get(panel).width ?? ''}px; height: ${$.get(panel).height ?? ''}px;`);
				$.set_attribute(img_2, 'src', $.get(displaySrc));
				$.set_style(img_2, $.get(frame));
				$.set_attribute(img_3, 'src', $.get(zoomSrc));
				classes = $.set_class(img_3, 1, 'absolute max-w-none object-contain object-center transition-opacity duration-200 svelte-v7i00l', null, classes, { 'opacity-0': !$.get(zoomHiResLoaded) });
				$.set_style(img_3, $.get(frame));
			});

			$.event('load', img_3, () => $.set(zoomHiResLoaded, true));
			$.replay_events(img_3);
			$.append($$anchor, div_5);
		};

		$.if(node_6, ($$render) => {
			if ($.get(showZoom) && $.get(box) && $.get(panel)) $$render(consequent_5);
		});
	}

	$.template_effect(() => $.set_style(div, `aspect-ratio: ${$.get(aspectWidth) ?? ''}/${$.get(aspectHeight) ?? ''}; ${height() !== 'auto' ? `height: ${height()}px;` : ''} ${width() !== 'auto' ? `width: ${width()}px;` : ''}`));
	$.event('mouseenter', div, openZoom);
	$.event('mouseleave', div, closeZoom);
	$.delegated('mousemove', div, handleMouseMove);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['mousemove']);