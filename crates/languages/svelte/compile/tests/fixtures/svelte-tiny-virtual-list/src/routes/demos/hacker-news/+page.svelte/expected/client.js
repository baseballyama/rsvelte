import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import VirtualList from '$lib/VirtualList.svelte';
import InfiniteLoading from 'svelte-infinite-loading';
import { asset } from '$app/paths';

var root = $.from_html(`(<a class="hacker-news-link svelte-1i8y5ma" target="_blank"> </a>)`, 1);
var root_1 = $.from_html(`<div><article class="hacker-news-item margin svelte-1i8y5ma"><div class="truncate"><a class="inline link" rel="external noopener noreferrer nofollow" target="_blank"> </a> <!></div> <div class="truncate"> <a class="hacker-news-link svelte-1i8y5ma" target="_blank"> </a> <a class="hacker-news-link svelte-1i8y5ma" target="_blank"> </a> | <a class="hacker-news-link svelte-1i8y5ma" target="_blank"> </a></div></article></div>`);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<div id="hacker-news-demo" class="demo-page flex-1 flex flex-column svelte-1i8y5ma"><header class="primary"><nav><i class="border white-border" aria-hidden="true"><img alt="Hacker News Logo"/></i> <h5>Hacker News</h5></nav></header> <div class="flex-1"><!></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const api = 'https://hn.algolia.com/api/v1/search_by_date' + '?tags=story' + `&numericFilters=created_at_i<=${Math.floor(Date.now() / 1000)}`;
	let page = $.state(1);
	let listHeight = $.state(0);

	/** @type {{story_id: string, created_at: string, title: string, author: string, url: string, points: number, num_comments: number}[]} */
	let list = $.state($.proxy([]));

	/**
	 * @param {CustomEvent<{ loaded: () => void; complete: () => void; error: () => void }>} event
	 */
	function infiniteHandler({ detail: { loaded, complete, error } }) {
		fetch(`${api}&page=${$.get(page)}`).then((response) => response.json()).then((data) => {
			if (data.hits.length) {
				$.set(page, $.get(page) + 1);
				$.set(list, [...$.get(list), ...data.hits], true);
				loaded();
			} else {
				complete();
			}
		}).catch(() => error());
	}

	/**
	 * @param {string} url
	 */
	function formatSite(url) {
		const domain = new URL(url).hostname;

		return domain.startsWith('www.') ? domain.slice(4) : domain;
	}

	const dateFormatter = new Intl.RelativeTimeFormat('en', { style: 'long' });

	/**
	 * @param {string} createdAt
	 */
	function formatCreatedAt(createdAt) {
		const seconds = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);

		if (seconds <= 60) {
			return dateFormatter.format(-seconds, 'second');
		} else if (seconds <= 3600) {
			return dateFormatter.format(-Math.floor(seconds / 60), 'minute');
		} else if (seconds <= 86400) {
			return dateFormatter.format(-Math.floor(seconds / 3600), 'hour');
		} else if (seconds <= 604800) {
			return dateFormatter.format(-Math.floor(seconds / 86400), 'day');
		} else if (seconds <= 2592000) {
			return dateFormatter.format(-Math.floor(seconds / 604800), 'week');
		} else if (seconds <= 31536000) {
			return dateFormatter.format(-Math.floor(seconds / 2592000), 'month');
		} else {
			return dateFormatter.format(-Math.floor(seconds / 31536000), 'year');
		}
	}

	var div = root_3();

	$.head('1i8y5ma', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Hacker News | svelte-tiny-virtual-list';
		});
	});

	var header = $.child(div);
	var nav = $.child(header);
	var i = $.child(nav);
	var img = $.only_child(i);

	$.next(2);
	$.reset(nav);
	$.reset(header);

	var div_1 = $.sibling(header, 2);
	var node = $.child(div_1);

	{
		const item = ($$anchor, $$arg0) => {
			let style = () => ($$arg0?.()).style;
			let index = () => ($$arg0?.()).index;
			var div_2 = root_1();
			var article = $.child(div_2);
			var div_3 = $.child(article);
			var a = $.child(div_3);
			var text = $.only_child(a, true);
			var node_1 = $.sibling(a, 2);

			{
				var consequent = ($$anchor) => {
					var fragment = root();
					var a_1 = $.sibling($.first_child(fragment));
					var text_1 = $.only_child(a_1, true);

					$.next();

					$.template_effect(
						($0, $1) => {
							$.set_attribute(a_1, 'href', `https://news.ycombinator.com/from?site=${$0 ?? ''}`);
							$.set_text(text_1, $1);
						},
						[
							() => formatSite($.get(list)[index()].url),
							() => formatSite($.get(list)[index()].url)
						]
					);

					$.append($$anchor, fragment);
				};

				$.if(node_1, ($$render) => {
					if ($.get(list)[index()].url) $$render(consequent);
				});
			}

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var text_2 = $.child(div_4);
			var a_2 = $.sibling(text_2);
			var text_3 = $.only_child(a_2, true);
			var a_3 = $.sibling(a_2, 2);
			var text_4 = $.only_child(a_3, true);
			var a_4 = $.sibling(a_3, 2);
			var text_5 = $.only_child(a_4);

			$.reset(div_4);
			$.reset(article);
			$.reset(div_2);

			$.template_effect(
				($0) => {
					$.set_style(div_2, style());
					$.set_attribute(article, 'data-num', index() + 1);
					$.set_attribute(a, 'href', $.get(list)[index()].url || `https://news.ycombinator.com/item?id=${$.get(list)[index()].story_id}`);
					$.set_text(text, $.get(list)[index()].title);
					$.set_text(text_2, `${$.get(list)[index()].points ?? ''} points by `);
					$.set_attribute(a_2, 'href', `https://news.ycombinator.com/user?id=${$.get(list)[index()].author ?? ''}`);
					$.set_text(text_3, $.get(list)[index()].author);
					$.set_attribute(a_3, 'title', $.get(list)[index()].created_at);
					$.set_attribute(a_3, 'href', `https://news.ycombinator.com/item?id=${$.get(list)[index()].story_id ?? ''}`);
					$.set_text(text_4, $0);
					$.set_attribute(a_4, 'href', `https://news.ycombinator.com/item?id=${$.get(list)[index()].story_id ?? ''}`);
					$.set_text(text_5, `${$.get(list)[index()].num_comments ?? ''} comments`);
				},
				[() => formatCreatedAt($.get(list)[index()].created_at)]
			);

			$.append($$anchor, div_2);
		};

		const footer = ($$anchor) => {
			var div_5 = root_2();
			var node_2 = $.child(div_5);

			InfiniteLoading(node_2, { $$events: { infinite: infiniteHandler } });
			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		VirtualList(node, {
			get height() {
				return $.get(listHeight);
			},
			itemSize: 90,
			get itemCount() {
				return $.get(list).length;
			},
			item,
			footer,
			$$slots: { item: true, footer: true }
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.template_effect(($0) => $.set_attribute(img, 'src', $0), [() => asset('/y18.svg')]);
	$.bind_element_size(div_1, 'clientHeight', ($$value) => $.set(listHeight, $$value));
	$.append($$anchor, div);
	$.pop();
}