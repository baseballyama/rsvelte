import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';

var root = $.from_html(`<p>...<!>...</p>`);
var root_1 = $.from_html(`<p> </p>`);
var root_2 = $.from_html(`<li><p><a class="c-link"> </a></p> <!></li>`);
var root_3 = $.from_html(`<ul class="space-y-2 px-4"></ul>`);
var root_4 = $.from_html(`<article class="space-y-4 py-4"><p class="font-fingerpaint text-lg"><a class="c-link"> </a></p> <!></article>`);
var root_5 = $.from_html(`<div class="c-loader mx-auto"></div>`);
var root_6 = $.from_html(`<li><!></li>`);
var root_7 = $.from_html(`<ul class="divide-outline divide-y"></ul>`);
var root_8 = $.from_html(`<div class="not-prose contents"><h1 class="text-4xl">Search</h1> <form class="mt-8" method="GET"><div class="flex gap-2"><label class="c-text-input flex-1"><i class="i i-[magnifying-glass] h-6 w-6 shrink-0"></i> <input type="text" name="q" id="q" placeholder="search something..."/></label> <button class="c-btn c-btn--outlined" type="submit">Search</button></div> <label class="text-fg-200 mt-1 block text-sm" for="q">Type and press enter or hit "search" button</label></form> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let pagefind = $.state(null);
	let sanitize = $.state(null);
	let query = $.state($.proxy($$props.data.query));

	let promise = $.derived(() => {
		if (!$.get(pagefind) || !$$props.data.query) return new Promise(() => {});

		return $.get(pagefind).debouncedSearch($$props.data.query, undefined, 500);
	});

	onMount(async () => {
		$.set(pagefind, await import('@pagefind'), true);
		$.set(sanitize, (await import('sanitize-html')).default, true);
		$.get(pagefind).init();
	});

	function submit(e) {
		e.preventDefault();

		const url = new URL($page().url);

		url.searchParams.set('q', $.get(query));
		goto(url, { replaceState: true });
	}

	function transformLink(url) {
		return url.replace('.html', '');
	}

	var div = root_8();
	var form = $.sibling($.child(div), 2);
	var div_1 = $.child(form);
	var label = $.child(div_1);
	var input = $.sibling($.child(label), 2);

	$.remove_input_defaults(input);
	$.reset(label);
	$.next(2);
	$.reset(div_1);
	$.next(2);
	$.reset(form);

	var node = $.sibling(form, 2);

	$.await(node, () => $.get(promise), null, ($$anchor, searched) => {
		var fragment = $.comment();
		var node_1 = $.first_child(fragment);

		{
			var consequent_2 = ($$anchor) => {
				var ul = root_7();

				$.each(ul, 21, () => $.get(searched).results, $.index, ($$anchor, $$item, $$index_1, $$array) => {
					let data = () => $.get($$item).data;
					var li = root_6();
					var node_2 = $.child(li);

					$.await(
						node_2,
						() => data()(),
						($$anchor) => {
							var div_2 = root_5();

							$.append($$anchor, div_2);
						},
						($$anchor, $$source) => {
							var $$value = $.derived(() => {
								var { meta, url, sub_results } = $.get($$source);

								return { meta, url, sub_results };
							});

							var meta = $.derived(() => $.get($$value).meta);
							var url = $.derived(() => $.get($$value).url);
							var sub_results = $.derived(() => $.get($$value).sub_results);
							var article = root_4();
							var p = $.child(article);
							var a = $.child(p);
							var text = $.only_child(a, true);

							$.reset(p);

							var node_3 = $.sibling(p, 2);

							{
								var consequent_1 = ($$anchor) => {
									var ul_1 = root_3();

									$.each(ul_1, 21, () => $.get(sub_results).slice(0, 5), $.index, ($$anchor, $$item, $$index, $$array_1) => {
										let title = () => $.get($$item).title;
										let url = () => $.get($$item).url;
										let excerpt = () => $.get($$item).excerpt;
										var li_1 = root_2();
										var p_1 = $.child(li_1);
										var a_1 = $.child(p_1);
										var text_1 = $.only_child(a_1, true);

										$.reset(p_1);

										var node_4 = $.sibling(p_1, 2);

										{
											var consequent = ($$anchor) => {
												var p_2 = root();
												var node_5 = $.sibling($.child(p_2));

												$.html(node_5, () => $.get(sanitize)(excerpt()));
												$.next();
												$.reset(p_2);
												$.append($$anchor, p_2);
											};

											var alternate = ($$anchor) => {
												var p_3 = root_1();
												var text_2 = $.only_child(p_3);

												$.template_effect(() => $.set_text(text_2, `...${excerpt() ?? ''}...`));
												$.append($$anchor, p_3);
											};

											$.if(node_4, ($$render) => {
												if ($.get(sanitize)) $$render(consequent); else $$render(alternate, -1);
											});
										}

										$.reset(li_1);

										$.template_effect(
											($0) => {
												$.set_attribute(a_1, 'href', $0);
												$.set_text(text_1, title());
											},
											[() => transformLink(url())]
										);

										$.append($$anchor, li_1);
									});

									$.reset(ul_1);
									$.append($$anchor, ul_1);
								};

								$.if(node_3, ($$render) => {
									if ($.get(sub_results)?.length) $$render(consequent_1);
								});
							}

							$.reset(article);

							$.template_effect(
								($0) => {
									$.set_attribute(a, 'href', $0);
									$.set_text(text, $.get(meta).title);
								},
								[() => transformLink($.get(url))]
							);

							$.append($$anchor, article);
						}
					);

					$.reset(li);
					$.append($$anchor, li);
				});

				$.reset(ul);
				$.append($$anchor, ul);
			};

			$.if(node_1, ($$render) => {
				if ($.get(searched)) $$render(consequent_2);
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(div);
	$.event('submit', form, submit);
	$.bind_value(input, () => $.get(query), ($$value) => $.set(query, $$value));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}