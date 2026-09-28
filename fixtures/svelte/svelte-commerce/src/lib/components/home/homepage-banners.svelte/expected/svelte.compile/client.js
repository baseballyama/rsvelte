import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Skeleton } from '$lib/components/ui/skeleton';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';

var root = $.from_html(`<div class="space-y-12"><div><!> <div class="grid grid-cols-2 gap-4"><!> <!></div></div></div>`);
var root_1 = $.from_html(`<div class="mb-10 flex flex-col items-center text-center"><h2 class="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl"> </h2> <div class="mt-4 h-1 w-12 bg-primary"></div></div>`);
var root_2 = $.from_html(`<div class="absolute bottom-6 left-6 text-white"><h3 class="text-xl font-bold"> </h3> <p class="mt-1 text-sm font-medium text-white/80">Explore Collection</p></div>`);
var root_3 = $.from_html(`<a class="group relative block w-full overflow-hidden rounded-none shadow-sm transition-all duration-500 hover:shadow-xl"><div class="relative overflow-hidden"><!> <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"><!></div></div></a>`);
var root_4 = $.from_html(`<div class="py-12"><!> <div><!></div></div>`);
var root_5 = $.from_html(`<div><!></div>`);

export default function Homepage_banners($$anchor, $$props) {
	$.push($$props, true);

	let bannersList = $.prop($$props, 'bannersList', 19, () => []);
	let loading = $.state(true);
	let loadedImages = $.proxy(new Set());

	const onImageLoad = (url) => {
		loadedImages.add(url);
	};

	$.user_effect(() => {
		$.set(loading, !bannersList()?.length);
	});

	var div = root_5();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var div_2 = $.child(div_1);
			var node_1 = $.child(div_2);

			Skeleton(node_1, { class: 'mx-auto mb-6 h-8 w-48 rounded-full' });

			var div_3 = $.sibling(node_1, 2);
			var node_2 = $.child(div_3);

			Skeleton(node_2, { class: 'aspect-[4/5] w-full rounded-none md:aspect-video' });

			var node_3 = $.sibling(node_2, 2);

			Skeleton(node_3, { class: 'aspect-[4/5] w-full rounded-none md:aspect-video' });
			$.reset(div_3);
			$.reset(div_2);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var consequent_5 = ($$anchor) => {
			var fragment = $.comment();
			var node_4 = $.first_child(fragment);

			$.each(node_4, 17, bannersList, $.index, ($$anchor, $$item) => {
				let title = () => $.get($$item).title;
				let link = () => $.get($$item).link;
				let isActive = () => $.get($$item).isActive;
				let banners = () => $.get($$item).banners;
				let itemsPerRow = () => $.get($$item).itemsPerRow;
				var fragment_1 = $.comment();
				var node_5 = $.first_child(fragment_1);

				{
					var consequent_4 = ($$anchor) => {
						var div_4 = root_4();
						var node_6 = $.child(div_4);

						{
							var consequent_1 = ($$anchor) => {
								var div_5 = root_1();
								var h2 = $.child(div_5);
								var text = $.only_child(h2, true);

								$.next(2);
								$.reset(div_5);
								$.template_effect(() => $.set_text(text, title()));
								$.append($$anchor, div_5);
							};

							$.if(node_6, ($$render) => {
								if (title()) $$render(consequent_1);
							});
						}

						var div_6 = $.sibling(node_6, 2);
						var node_7 = $.child(div_6);

						{
							var consequent_3 = ($$anchor) => {
								var fragment_2 = $.comment();
								var node_8 = $.first_child(fragment_2);

								$.each(node_8, 17, banners, $.index, ($$anchor, banner) => {
									var a = root_3();
									var div_7 = $.child(a);
									var node_9 = $.child(div_7);

									{
										let $0 = $.derived(() => $.get(banner).title || $.get(banner).link);
										let $1 = $.derived(() => itemsPerRow() === 1 ? '21:9' : '1:1');

										LazyImg(node_9, {
											get src() {
												return $.get(banner).url;
											},

											get alt() {
												return $.get($0);
											},

											get aspectRatio() {
												return $.get($1);
											},
											class: 'relative w-full'
										});
									}

									var div_8 = $.sibling(node_9, 2);
									var node_10 = $.child(div_8);

									{
										var consequent_2 = ($$anchor) => {
											var div_9 = root_2();
											var h3 = $.child(div_9);
											var text_1 = $.only_child(h3, true);

											$.next(2);
											$.reset(div_9);
											$.template_effect(() => $.set_text(text_1, $.get(banner).title));
											$.append($$anchor, div_9);
										};

										$.if(node_10, ($$render) => {
											if ($.get(banner).title) $$render(consequent_2);
										});
									}

									$.reset(div_8);
									$.reset(div_7);
									$.reset(a);

									$.template_effect(() => {
										$.set_attribute(a, 'href', $.get(banner).link || link());
										$.set_attribute(a, 'aria-label', $.get(banner).title || $.get(banner).link);
									});

									$.append($$anchor, a);
								});

								$.append($$anchor, fragment_2);
							};

							$.if(node_7, ($$render) => {
								if (banners().length) $$render(consequent_3);
							});
						}

						$.reset(div_6);
						$.reset(div_4);
						$.template_effect(() => $.set_class(div_6, 1, `grid grid-cols-${itemsPerRow() ?? ''} gap-4 md:gap-8`));
						$.append($$anchor, div_4);
					};

					$.if(node_5, ($$render) => {
						if (isActive()) $$render(consequent_4);
					});
				}

				$.append($$anchor, fragment_1);
			});

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else if (bannersList().length) $$render(consequent_5, 1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}