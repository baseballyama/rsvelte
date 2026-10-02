import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import Button from '$lib/components/ui/button/button.svelte';
import { ShoppingBag, Home, ArrowLeft, Search, Package, Tag } from '@lucide/svelte';
import { goto } from '$app/navigation';
import SeoHeader from '$lib/components/seo/seo-header.svelte';

var root = $.from_html(`<!> Go Back`, 1);
var root_1 = $.from_html(`<!> Return Home`, 1);
var root_2 = $.from_html(`<!> <div class="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4"><div class="max-w-2xl text-center"><div class="mb-4 flex justify-center"><!></div> <h1 class="mb-2 text-6xl font-bold text-primary"> </h1> <h2 class="mb-8 text-2xl font-semibold text-gray-600"> </h2> <p class="mb-8 text-gray-500"><!></p> <div class="mb-8"><form class="mx-auto max-w-md"><div class="relative"><!> <input type="text" placeholder="Search for products..." class="w-full rounded-lg border border-gray-300 px-10 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"/> <!></div></form></div> <div class="mb-8 flex flex-wrap justify-center gap-4 text-sm text-gray-600"><a href="/" class="transition-colors hover:text-primary">Home</a> <span>•</span> <a href="/categories" class="transition-colors hover:text-primary">Categories</a> <span>•</span> <a href="/products" class="transition-colors hover:text-primary">All Products</a> <span>•</span> <a href="/contact-us" class="transition-colors hover:text-primary">Contact Us</a></div> <div class="flex flex-col gap-4 sm:flex-row sm:justify-center"><!> <!></div></div></div>`, 1);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	let searchQuery = $.state('');

	function handleSearch() {
		if ($.get(searchQuery).trim()) {
			goto(`/search?q=${encodeURIComponent($.get(searchQuery).trim())}`);
		}
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => `Error ${page.status}`);

		SeoHeader(node, {
			get metaTitle() {
				return $.get($0);
			},
			noindex: true
		});
	}

	var div = $.sibling(node, 2);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node_1 = $.child(div_2);

	ShoppingBag(node_1, { class: 'h-24 w-24 animate-bounce text-primary' });
	$.reset(div_2);

	var h1 = $.sibling(div_2, 2);
	var text = $.only_child(h1, true);
	var h2 = $.sibling(h1, 2);
	var text_1 = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var node_2 = $.child(p);

	{
		var consequent = ($$anchor) => {
			var text_2 = $.text('The page you\'re looking for doesn\'t exist.');

			$.append($$anchor, text_2);
		};

		var alternate = ($$anchor) => {
			var text_3 = $.text('We encountered an unexpected error. Our team has been notified.');

			$.append($$anchor, text_3);
		};

		$.if(node_2, ($$render) => {
			if (page.status === 404) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(p);

	var div_3 = $.sibling(p, 2);
	var form = $.child(div_3);
	var div_4 = $.child(form);
	var node_3 = $.child(div_4);

	Search(node_3, {
		class: 'absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400'
	});

	var input = $.sibling(node_3, 2);

	$.remove_input_defaults(input);

	var node_4 = $.sibling(input, 2);

	Button(node_4, {
		type: 'submit',
		class: 'absolute right-2 top-1/2 -translate-y-1/2',
		onclick: () => handleSearch(),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Search');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.reset(form);
	$.reset(div_3);

	var div_5 = $.sibling(div_3, 4);
	var node_5 = $.child(div_5);

	Button(node_5, {
		variant: 'outline',
		class: 'gap-2',
		onclick: () => {
			goto('/');
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_6 = $.first_child(fragment_1);

			ArrowLeft(node_6, { class: 'h-4 w-4' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_5, 2);

	Button(node_7, {
		class: 'gap-2',
		onclick: () => goto('/'),
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_8 = $.first_child(fragment_2);

			Home(node_8, { class: 'h-4 w-4' });
			$.next();
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, page.status);
		$.set_text(text_1, page.error?.message || 'Something went wrong');
	});

	$.event('submit', form, (e) => {
		e.preventDefault();
		handleSearch();
	});

	$.bind_value(input, () => $.get(searchQuery), ($$value) => $.set(searchQuery, $$value));
	$.append($$anchor, fragment);
	$.pop();
}