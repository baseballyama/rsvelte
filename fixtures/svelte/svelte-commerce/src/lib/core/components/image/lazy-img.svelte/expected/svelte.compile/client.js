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
	'priority',
	'loading',
	'fetchpriority',
	'sizes'
]);

var root = $.from_html(`<div class="absolute inset-0 flex items-center justify-center bg-gray-50 animate-pulse svelte-wp2cuc"></div>`);
var root_1 = $.from_html(`<img/>`);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<div class="relative bg-transparent w-full svelte-wp2cuc"><!> <!></div>`);

export default function Lazy_img($$anchor, $$props) {
	$.push($$props, true);

	let alt = $.prop($$props, 'alt', 3, ''),
		height = $.prop($$props, 'height', 3, 'auto'),
		src = $.prop($$props, 'src', 3, ''),
		aspectRatio = $.prop($$props, 'aspectRatio', 19, () => page?.data?.store?.productImageAspectRatio),
		width = $.prop($$props, 'width', 3, 'auto'),
		priority = $.prop($$props, 'priority', 3, false),
		loading = $.prop($$props, 'loading', 19, () => priority() ? 'eager' : 'lazy'),
		fetchpriority = $.prop($$props, 'fetchpriority', 19, () => priority() ? 'high' : 'auto'),
		sizes = $.prop($$props, 'sizes', 3, undefined),
		rest = $.rest_props($$props, rest_excludes);

	// Fallback CDN resize width for responsive (w-full) images that pass no explicit
	// width. Without it the CDN URL omits width=/height= and serves the full-res original.
	const DEFAULT_CDN_WIDTH = 1280;

	// Candidate widths offered to the browser when `sizes` is set. The browser picks the
	// smallest one that satisfies the rendered size at the device's pixel density, so image
	// resolution adapts to the device instead of always fetching DEFAULT_CDN_WIDTH.
	const SRCSET_WIDTHS = [160, 240, 320, 480, 640, 768, 1024, 1280];

	const h = $.derived(() => height() === 'auto' ? '0' : +height() * 2);
	const w = $.derived(() => width() === 'auto' ? '0' : +width() * 2);

	// Intrinsic-size ATTRIBUTES, as opposed to the CDN resize hints above. Omitted entirely when
	// the caller sizes the image responsively (`auto`, the default used by every product card):
	// `width="0" height="0"` is what Lighthouse, axe and crawlers read as the real intrinsic
	// size, and browsers that infer a ratio from the pair get 0/0 — defeating the very CLS
	// protection the surrounding aspect-ratio box exists to provide.
	const attrW = $.derived(() => width() === 'auto' ? undefined : +$.get(w));

	const attrH = $.derived(() => height() === 'auto' ? undefined : +$.get(h));

	// Width fed to the CDN URL builder: real width when given, else the fallback.
	const cdnW = $.derived(() => width() === 'auto' ? DEFAULT_CDN_WIDTH : +width() * 2);

	// Device-responsive srcset (width descriptors) built from the CDN. Only emitted when a
	// caller supplies `sizes`, so existing single-src usage is unchanged.
	const cdnSrcset = $.derived(() => sizes()
		? SRCSET_WIDTHS.map((sw) => `${getImageCDNUrl(src(), sw, 0)} ${sw}w`).join(', ')
		: undefined);

	const $$d = $.derived(() => aspectRatio()?.split(':') || ['1', '1']),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		aspectWidth = $.derived(() => $.get($$array)[0]),
		aspectHeight = $.derived(() => $.get($$array)[1]);

	const extension = $.derived(() => src()?.split('.').pop());
	let loaded = $.state(false);
	let error = $.state(false);
	let isIntersecting = $.state(false);
	let containerRef;
	let usingFallback = $.state(false // Track if we're using fallback
	);

	// Transparent placeholder
	const transparentPlaceholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

	let observer;

	onMount(() => {
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

		if (containerRef) {
			observer.observe(containerRef);
		}

		return () => {
			if (observer) {
				observer.disconnect();
			}
		};
	});

	$.user_effect(() => {
		if (src()) {
			$.set(loaded, false);
			$.set(error, false);
			$.set(usingFallback, false);
		}
	});

	var div = root_3();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ((!$.get(loaded) || $.get(error)) && !priority()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_2 = root_2();
			var node_2 = $.child(div_2);

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
							fetchpriority: fetchpriority(),
							decoding: 'async',
							style: `aspect-ratio: ${$.get(aspectWidth) ?? ''}/${$.get(aspectHeight) ?? ''}; ${height() !== 'auto' ? `height: ${height()}px;` : ''} ${width() !== 'auto' ? `width: ${width()}px;` : ''}`,
							'data-nimg': '1',
							loading: loading(),
							srcset: $.get(cdnSrcset),
							sizes: sizes(),
							src: $0,
							height: $.get(attrH),
							width: $.get(attrW),
							class: `h-full w-full object-contain object-center transition-opacity duration-300 ${$$props.class ?? ''}`,
							...rest,
							[$.CLASS]: {
								'opacity-0': !($.get(loaded) || priority()),
								'opacity-100': $.get(loaded) || priority()
							}
						}),
						[() => getImageCDNUrl(src(), $.get(cdnW), $.get(h))],
						void 0,
						void 0,
						'svelte-wp2cuc'
					);

					$.replay_events(img);
					$.append($$anchor, img);
				};

				$.if(node_2, ($$render) => {
					if ($.get(isIntersecting) || priority()) $$render(consequent_1);
				});
			}

			$.reset(div_2);
			$.template_effect(() => $.set_class(div_2, 1, $.clsx($$props.class), 'svelte-wp2cuc'));
			$.append($$anchor, div_2);
		};

		var alternate = ($$anchor) => {
			var div_3 = root_2();
			var node_3 = $.child(div_3);

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
							loading: loading(),
							fetchpriority: fetchpriority(),
							decoding: 'async',
							'data-nimg': '1',
							style: `aspect-ratio: ${$.get(aspectWidth) ?? ''}/${$.get(aspectHeight) ?? ''}; ${height() !== 'auto' ? `height: ${height()}px;` : ''} ${width() !== 'auto' ? `width: ${width()}px;` : ''}`,
							height: $.get(attrH),
							width: $.get(attrW),
							class: `h-full w-full object-contain object-center transition-opacity duration-300 ${$$props.class ?? ''}`,
							...rest,
							[$.CLASS]: {
								'opacity-0': !($.get(loaded) || priority()),
								'opacity-100': $.get(loaded) || priority()
							}
						}),
						void 0,
						void 0,
						void 0,
						'svelte-wp2cuc'
					);

					$.replay_events(img_1);
					$.append($$anchor, img_1);
				};

				$.if(node_3, ($$render) => {
					if ($.get(isIntersecting) || priority()) $$render(consequent_3);
				});
			}

			$.reset(div_3);

			$.template_effect(() => {
				$.set_class(div_3, 1, $.clsx($$props.class), 'svelte-wp2cuc');
				$.set_style(div_3, `${width() !== 'auto' ? `width: ${width()}px;` : ''} ${height() !== 'auto' ? `height: ${height()}px;` : ''}`);
			});

			$.append($$anchor, div_3);
		};

		$.if(node_1, ($$render) => {
			if (page?.data?.store?.plugins?.imageCdn?.active && !$.get(usingFallback)) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => containerRef = $$value, () => containerRef);
	$.template_effect(() => $.set_style(div, `aspect-ratio: ${$.get(aspectWidth) ?? ''}/${$.get(aspectHeight) ?? ''}; ${height() !== 'auto' ? `height: ${height()}px;` : ''} ${width() !== 'auto' ? `width: ${width()}px;` : ''}`));
	$.append($$anchor, div);
	$.pop();
}