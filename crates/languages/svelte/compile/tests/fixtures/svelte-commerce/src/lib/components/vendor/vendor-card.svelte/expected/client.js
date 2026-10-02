import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import EmptyImage from '$lib/core/components/image/empty-image.svelte';

var root = $.from_html(`<p class="text-xs text-muted-foreground"> </p>`);
var root_1 = $.from_html(`<a class="group flex flex-col gap-3"><div class="aspect-square overflow-hidden rounded-radius border border-border bg-muted"><!></div> <div class="flex flex-col gap-0.5"><h2 class="text-sm font-semibold text-foreground"> </h2> <!></div></a>`);

export default function Vendor_card($$anchor, $$props) {
	$.push($$props, true);

	// /vendors used to render its vendors through product-card.svelte, which reads `product.mrp`
	// and links every card to `/products/<slug>`. That threw on init and, once the prop was
	// renamed, still pointed every vendor at a product URL that 404s. Vendors get their own card
	// and link to /store/<slug>, the route that actually renders a vendor storefront.
	const priority = $.prop($$props, 'priority', 3, false);

	const title = $.derived(() => $$props.vendor?.businessName || $$props.vendor?.name || 'Vendor');
	const image = $.derived(() => $$props.vendor?.featuredImage || $$props.vendor?.logo);
	const place = $.derived(() => [$$props.vendor?.city, $$props.vendor?.countryName].filter(Boolean).join(', '));
	var a = root_1();
	var div = $.child(a);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			LazyImg($$anchor, {
				get src() {
					return $.get(image);
				},

				get alt() {
					return `${$.get(title) ?? ''} storefront`;
				},
				sizes: '(min-width: 1024px) 25vw, (min-width: 768px) 38vw, 50vw',
				class: 'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
				get priority() {
					return priority();
				}
			});
		};

		var alternate = ($$anchor) => {
			EmptyImage($$anchor, { class: 'h-full w-full' });
		};

		$.if(node, ($$render) => {
			if ($.get(image)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var h2 = $.child(div_1);
	var text = $.only_child(h2, true);
	var node_1 = $.sibling(h2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var p = root();
			var text_1 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_1, $.get(place)));
			$.append($$anchor, p);
		};

		$.if(node_1, ($$render) => {
			if ($.get(place)) $$render(consequent_1);
		});
	}

	$.reset(div_1);
	$.reset(a);

	$.template_effect(() => {
		$.set_attribute(a, 'href', `/store/${$$props.vendor?.slug ?? ''}`);
		$.set_attribute(a, 'aria-label', `Visit ${$.get(title) ?? ''}`);
		$.set_text(text, $.get(title));
	});

	$.append($$anchor, a);
	$.pop();
}