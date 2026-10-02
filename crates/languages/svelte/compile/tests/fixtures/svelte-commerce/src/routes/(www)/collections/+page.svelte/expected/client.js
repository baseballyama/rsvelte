import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import Select from '$lib/components/form/select.svelte';
import { goto } from '$app/navigation';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import Pagination from '$lib/components/common/pagination.svelte';
import SeoHeader from '$lib/components/seo/seo-header.svelte';

var root = $.from_html(`<div class="flex h-96 items-center justify-center"><p class="text-sm text-muted-foreground">No collections found</p></div>`);
var root_1 = $.from_html(`<p class="text-xs text-muted-foreground"> </p>`);
var root_2 = $.from_html(`<li><a class="group flex flex-col gap-2"><div class="aspect-square overflow-hidden rounded-md border border-border bg-muted"><!></div> <h2 class="text-sm font-medium text-foreground group-hover:underline"> </h2> <!></a></li>`);
var root_3 = $.from_html(`<ul class="mt-4 grid grid-cols-2 gap-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4"></ul> <div class="mt-20"><!></div>`, 1);
var root_4 = $.from_html(`<!> <div class="container mx-auto mt-2 flex h-full min-h-screen flex-col max-md:px-4 md:gap-2"><div class="flex-1"><div class="mb-4 flex flex-col items-start gap-2"><h1 class="text-2xl font-bold">All Collections</h1> <span class="text-sm text-muted-foreground"> </span></div> <div class="hidden flex-row items-center gap-2 md:flex"><span class="text-sm font-normal text-muted-foreground">Sort by:</span> <!></div> <!></div></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// The route's +page.ts (wwwCollectonsLoad) already fetches the collection list server-side.
	// This page used to ignore it and re-run a *product* search in an $effect, which never runs
	// during SSR — so crawlers were served "0 Collections found" above an empty grid.
	const collections = $.derived(() => page.data?.data || []);

	const count = $.derived(() => page.data?.count ?? 0);
	const noOfPage = $.derived(() => page.data?.noOfPage);
	let selectedSort = $.state($.proxy(page.url.searchParams.get('sort') || '-createdAt'));
	const storeName = $.derived(() => page.data?.store?.name);

	const selectSort = (value) => {
		goto(`/collections?sort=${value}`);
	};

	var fragment = root_4();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => $.get(storeName) ? `Collections | ${$.get(storeName)}` : 'Collections');

		SeoHeader(node, {
			get metaTitle() {
				return $.get($0);
			},
			metaDescription: 'Browse every curated product collection in the store.'
		});
	}

	var div = $.sibling(node, 2);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var span = $.sibling($.child(div_2), 2);
	var text = $.only_child(span);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_1 = $.sibling($.child(div_3), 2);

	Select(node_1, {
		class: '!mb-0',
		id: 'sort-by',
		get value() {
			return $.get(selectedSort);
		},

		data: [
			{ value: '-createdAt', name: "What's New" },
			{ value: 'createdAt', name: 'Oldest First' },
			{ value: 'name', name: 'Name: A-Z' },
			{ value: '-name', name: 'Name: Z-A' }
		],

		optionSelected: (value) => {
			$.set(selectedSort, value, true);
			selectSort(value);
		}
	});

	$.reset(div_3);

	var node_2 = $.sibling(div_3, 2);

	{
		var consequent = ($$anchor) => {
			var div_4 = root();

			$.append($$anchor, div_4);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_3();
			var ul = $.first_child(fragment_1);

			$.each(ul, 21, () => $.get(collections), $.index, ($$anchor, collection, i) => {
				var li = root_2();
				var a = $.child(li);
				var div_5 = $.child(a);
				var node_3 = $.child(div_5);

				{
					let $0 = $.derived(() => $.get(collection).img || $.get(collection).images?.[0]);

					LazyImg(node_3, {
						get src() {
							return $.get($0);
						},

						get alt() {
							return $.get(collection).name;
						},
						width: 400,
						height: 400,
						class: 'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
						priority: i < 4
					});
				}

				$.reset(div_5);

				var h2 = $.sibling(div_5, 2);
				var text_1 = $.only_child(h2, true);
				var node_4 = $.sibling(h2, 2);

				{
					var consequent_1 = ($$anchor) => {
						var p = root_1();
						var text_2 = $.only_child(p, true);

						$.template_effect(() => $.set_text(text_2, $.get(collection).subTitle));
						$.append($$anchor, p);
					};

					$.if(node_4, ($$render) => {
						if ($.get(collection).subTitle) $$render(consequent_1);
					});
				}

				$.reset(a);
				$.reset(li);

				$.template_effect(() => {
					$.set_attribute(a, 'href', `/collections/${($.get(collection).slug || $.get(collection).id) ?? ''}`);
					$.set_text(text_1, $.get(collection).title || $.get(collection).name);
				});

				$.append($$anchor, li);
			});

			$.reset(ul);

			var div_6 = $.sibling(ul, 2);
			var node_5 = $.child(div_6);

			Pagination(node_5, {
				get noOfPage() {
					return $.get(noOfPage);
				}
			});

			$.reset(div_6);
			$.append($$anchor, fragment_1);
		};

		$.if(node_2, ($$render) => {
			if (!$.get(collections).length) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text, `${$.get(count) ?? ''} ${$.get(count) === 1 ? 'Collection' : 'Collections'} found`));
	$.append($$anchor, fragment);
	$.pop();
}