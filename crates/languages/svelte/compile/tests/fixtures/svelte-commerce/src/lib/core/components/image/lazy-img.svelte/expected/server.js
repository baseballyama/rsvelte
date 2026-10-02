import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { page } from '$app/state';
import { getImageCDNUrl } from '@misiki/kitcommerce-core/utils';

export default function Lazy_img($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: klass,
			alt = '',
			height = 'auto',
			src = '',
			aspectRatio = page?.data?.store?.productImageAspectRatio,
			width = 'auto',
			priority = false,
			loading = priority ? 'eager' : 'lazy',
			fetchpriority = priority ? 'high' : 'auto',
			sizes = undefined,
			$$slots,
			$$events,
			...rest
		} = $$props;

		// Fallback CDN resize width for responsive (w-full) images that pass no explicit
		// width. Without it the CDN URL omits width=/height= and serves the full-res original.
		const DEFAULT_CDN_WIDTH = 1280;

		// Candidate widths offered to the browser when `sizes` is set. The browser picks the
		// smallest one that satisfies the rendered size at the device's pixel density, so image
		// resolution adapts to the device instead of always fetching DEFAULT_CDN_WIDTH.
		const SRCSET_WIDTHS = [160, 240, 320, 480, 640, 768, 1024, 1280];

		const h = $.derived(() => height === 'auto' ? '0' : +height * 2);
		const w = $.derived(() => width === 'auto' ? '0' : +width * 2);

		// Intrinsic-size ATTRIBUTES, as opposed to the CDN resize hints above. Omitted entirely when
		// the caller sizes the image responsively (`auto`, the default used by every product card):
		// `width="0" height="0"` is what Lighthouse, axe and crawlers read as the real intrinsic
		// size, and browsers that infer a ratio from the pair get 0/0 — defeating the very CLS
		// protection the surrounding aspect-ratio box exists to provide.
		const attrW = $.derived(() => width === 'auto' ? undefined : +w());

		const attrH = $.derived(() => height === 'auto' ? undefined : +h());

		// Width fed to the CDN URL builder: real width when given, else the fallback.
		const cdnW = $.derived(() => width === 'auto' ? DEFAULT_CDN_WIDTH : +width * 2);

		// Device-responsive srcset (width descriptors) built from the CDN. Only emitted when a
		// caller supplies `sizes`, so existing single-src usage is unchanged.
		const cdnSrcset = $.derived(() => sizes
			? SRCSET_WIDTHS.map((sw) => `${getImageCDNUrl(src, sw, 0)} ${sw}w`).join(', ')
			: undefined);

		const $$d = $.derived(() => aspectRatio?.split(':') || ['1', '1']),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			aspectWidth = $.derived(() => $$derived_array()[0]),
			aspectHeight = $.derived(() => $$derived_array()[1]);

		const extension = $.derived(() => src?.split('.').pop());
		let loaded = false;
		let error = false;
		let isIntersecting = false;
		let containerRef;
		let usingFallback = false; // Track if we're using fallback

		// Transparent placeholder
		const transparentPlaceholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

		let observer;

		onMount(() => {
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
			};
		});

		$$renderer.push(`<div class="relative bg-transparent w-full svelte-wp2cuc"${$.attr_style(`aspect-ratio: ${$.stringify(aspectWidth())}/${$.stringify(aspectHeight())}; ${height !== 'auto' ? `height: ${height}px;` : ''} ${width !== 'auto' ? `width: ${width}px;` : ''}`)}>`);

		if ((!loaded || error) && !priority) {
			$$renderer.push(`<!--[0--><div class="absolute inset-0 flex items-center justify-center bg-gray-50 animate-pulse svelte-wp2cuc"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (page?.data?.store?.plugins?.imageCdn?.active && !usingFallback) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(klass), 'svelte-wp2cuc')}>`);

			if (isIntersecting || priority) {
				$$renderer.push(`<!--[0--><img${$.attributes(
					{
						alt,
						draggable: 'false',
						fetchpriority,
						decoding: 'async',
						style: `aspect-ratio: ${$.stringify(aspectWidth())}/${$.stringify(aspectHeight())}; ${height !== 'auto' ? `height: ${height}px;` : ''} ${width !== 'auto' ? `width: ${width}px;` : ''}`,
						'data-nimg': '1',
						loading,
						srcset: cdnSrcset(),
						sizes,
						src: getImageCDNUrl(src, cdnW(), h()),
						height: attrH(),
						width: attrW(),
						class: `h-full w-full object-contain object-center transition-opacity duration-300 ${$.stringify(klass)}`,
						...rest
					},
					'svelte-wp2cuc',
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
			$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(klass), 'svelte-wp2cuc')}${$.attr_style(`${width !== 'auto' ? `width: ${width}px;` : ''} ${height !== 'auto' ? `height: ${height}px;` : ''}`)}>`);

			if (isIntersecting || priority) {
				$$renderer.push(`<!--[0--><img${$.attributes(
					{
						alt,
						src,
						draggable: 'false',
						loading,
						fetchpriority,
						decoding: 'async',
						'data-nimg': '1',
						style: `aspect-ratio: ${$.stringify(aspectWidth())}/${$.stringify(aspectHeight())}; ${height !== 'auto' ? `height: ${height}px;` : ''} ${width !== 'auto' ? `width: ${width}px;` : ''}`,
						height: attrH(),
						width: attrW(),
						class: `h-full w-full object-contain object-center transition-opacity duration-300 ${$.stringify(klass)}`,
						...rest
					},
					'svelte-wp2cuc',
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

		$$renderer.push(`<!--]--></div>`);
	});
}