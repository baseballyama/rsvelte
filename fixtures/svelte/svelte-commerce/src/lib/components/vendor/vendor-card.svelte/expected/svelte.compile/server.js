import * as $ from 'svelte/internal/server';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import EmptyImage from '$lib/core/components/image/empty-image.svelte';

export default function Vendor_card($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// /vendors used to render its vendors through product-card.svelte, which reads `product.mrp`
		// and links every card to `/products/<slug>`. That threw on init and, once the prop was
		// renamed, still pointed every vendor at a product URL that 404s. Vendors get their own card
		// and link to /store/<slug>, the route that actually renders a vendor storefront.
		const { vendor, priority = false } = $$props;

		const title = $.derived(() => vendor?.businessName || vendor?.name || 'Vendor');
		const image = $.derived(() => vendor?.featuredImage || vendor?.logo);
		const place = $.derived(() => [vendor?.city, vendor?.countryName].filter(Boolean).join(', '));

		$$renderer.push(`<a${$.attr('href', `/store/${$.stringify(vendor?.slug)}`)} class="group flex flex-col gap-3"${$.attr('aria-label', `Visit ${$.stringify(title())}`)}><div class="aspect-square overflow-hidden rounded-radius border border-border bg-muted">`);

		if (image()) {
			$$renderer.push('<!--[0-->');

			LazyImg($$renderer, {
				src: image(),
				alt: `${$.stringify(title())} storefront`,
				sizes: '(min-width: 1024px) 25vw, (min-width: 768px) 38vw, 50vw',
				class: 'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
				priority
			});
		} else {
			$$renderer.push('<!--[-1-->');
			EmptyImage($$renderer, { class: 'h-full w-full' });
		}

		$$renderer.push(`<!--]--></div> <div class="flex flex-col gap-0.5"><h2 class="text-sm font-semibold text-foreground">${$.escape(title())}</h2> `);

		if (place()) {
			$$renderer.push(`<!--[0--><p class="text-xs text-muted-foreground">${$.escape(place())}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></a>`);
	});
}