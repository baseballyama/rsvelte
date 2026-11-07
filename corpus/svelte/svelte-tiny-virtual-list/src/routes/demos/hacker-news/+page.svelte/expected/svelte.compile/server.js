import * as $ from 'svelte/internal/server';
import VirtualList from '$lib/VirtualList.svelte';
import InfiniteLoading from 'svelte-infinite-loading';
import { asset } from '$app/paths';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const api = 'https://hn.algolia.com/api/v1/search_by_date' + '?tags=story' + `&numericFilters=created_at_i<=${Math.floor(Date.now() / 1000)}`;
		let page = 1;
		let listHeight = 0;

		/** @type {{story_id: string, created_at: string, title: string, author: string, url: string, points: number, num_comments: number}[]} */
		let list = [];

		/**
		 * @param {CustomEvent<{ loaded: () => void; complete: () => void; error: () => void }>} event
		 */
		function infiniteHandler({ detail: { loaded, complete, error } }) {
			fetch(`${api}&page=${page}`).then((response) => response.json()).then((data) => {
				if (data.hits.length) {
					page += 1;
					list = [...list, ...data.hits];
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

		$.head('1i8y5ma', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Hacker News | svelte-tiny-virtual-list</title>`);
			});
		});

		$$renderer.push(`<div id="hacker-news-demo" class="demo-page flex-1 flex flex-column svelte-1i8y5ma"><header class="primary"><nav><i class="border white-border" aria-hidden="true"><img${$.attr('src', asset('/y18.svg'))} alt="Hacker News Logo"/></i> <h5>Hacker News</h5></nav></header> <div class="flex-1">`);

		{
			function item($$renderer, { style, index }) {
				$$renderer.push(`<div${$.attr_style(style)}><article class="hacker-news-item margin svelte-1i8y5ma"${$.attr('data-num', index + 1)}><div class="truncate"><a class="inline link"${$.attr('href', list[index].url || `https://news.ycombinator.com/item?id=${list[index].story_id}`)} rel="external noopener noreferrer nofollow" target="_blank">${$.escape(list[index].title)}</a> `);

				if (list[index].url) {
					$$renderer.push(`<!--[0-->(<a class="hacker-news-link svelte-1i8y5ma"${$.attr('href', `https://news.ycombinator.com/from?site=${$.stringify(formatSite(list[index].url))}`)} target="_blank">${$.escape(formatSite(list[index].url))}</a>)`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <div class="truncate">${$.escape(list[index].points)} points by <a class="hacker-news-link svelte-1i8y5ma"${$.attr('href', `https://news.ycombinator.com/user?id=${$.stringify(list[index].author)}`)} target="_blank">${$.escape(list[index].author)}</a> <a class="hacker-news-link svelte-1i8y5ma"${$.attr('title', list[index].created_at)}${$.attr('href', `https://news.ycombinator.com/item?id=${$.stringify(list[index].story_id)}`)} target="_blank">${$.escape(formatCreatedAt(list[index].created_at))}</a> | <a class="hacker-news-link svelte-1i8y5ma" target="_blank"${$.attr('href', `https://news.ycombinator.com/item?id=${$.stringify(list[index].story_id)}`)}>${$.escape(list[index].num_comments)} comments</a></div></article></div>`);
			}

			function footer($$renderer) {
				$$renderer.push(`<div>`);
				InfiniteLoading($$renderer, {});
				$$renderer.push(`<!----></div>`);
			}

			VirtualList($$renderer, {
				height: listHeight,
				itemSize: 90,
				itemCount: list.length,
				item,
				footer,
				$$slots: { item: true, footer: true }
			});
		}

		$$renderer.push(`<!----></div></div>`);
	});
}