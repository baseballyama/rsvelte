import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconLock } from '@tabler/icons-svelte';
import { s } from '$lib/client/localization.svelte';
import FaviconImage from '$lib/components/common/FaviconImage.svelte';
import Tooltip from '$lib/components/Tooltip.svelte';
import { languageSettings } from '$lib/data/settings.svelte.js';
import { dataService } from '$lib/services/dataService';
import { preferredSources } from '$lib/stores/preferredSources.svelte.js';
import { getMostRecentArticleDate, getTimeAgo } from '$lib/utils/getTimeAgo';

var root = $.from_html(`<button class="text-gray-600 hover:text-gray-800 focus-visible-ring rounded dark:text-gray-400 dark:hover:text-gray-200"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>`);
var root_1 = $.from_html(`<span class="flex-shrink-0"><!></span>`);
var root_2 = $.from_html(`<a target="_blank" rel="noopener noreferrer" class="flex w-full flex-col items-start space-y-1 rounded-lg py-2 ps-2 text-start transition-colors hover:bg-gray-100 focus-visible-ring dark:hover:bg-gray-700"><div class="flex w-full min-w-0 items-center space-x-2"><!> <span class="truncate text-sm font-semibold" dir="auto"> </span> <!></div> <span class="ms-7 text-xs text-gray-500 dark:text-gray-400"><!></span></a>`);
var root_3 = $.from_html(`<section class="mt-6"><div class="mb-4 flex items-center justify-between"><div><h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200"> </h3> <p class="text-sm text-gray-600 dark:text-gray-400 mt-1"> </p></div> <!></div> <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"></div></section>`);

export default function StorySources($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let showSourceOverlay = $.prop($$props, 'showSourceOverlay', 15, false),
		currentSource = $.prop($$props, 'currentSource', 15, null),
		sourceArticles = $.prop($$props, 'sourceArticles', 31, () => $.proxy([])),
		currentMediaInfo = $.prop($$props, 'currentMediaInfo', 15, null),
		isLoadingMediaInfo = $.prop($$props, 'isLoadingMediaInfo', 15, false),
		storyLocalizer = $.prop($$props, 'storyLocalizer', 3, s);

	// Sort domains: preferred first, then regular, then Reddit at end
	let sortedDomains = $.derived(() => {
		if (!$$props.domains || $$props.domains.length === 0) return [];

		// Separate into: preferred (non-reddit), regular (non-reddit), reddit
		const preferred = $$props.domains.filter((d) => preferredSources.isPreferred(d?.name) && !d?.name?.toLowerCase().includes('reddit.com'));

		const regular = $$props.domains.filter((d) => !preferredSources.isPreferred(d?.name) && !d?.name?.toLowerCase().includes('reddit.com'));
		const reddit = $$props.domains.filter((d) => d?.name?.toLowerCase().includes('reddit.com'));

		// Concatenate: preferred first, then regular, then Reddit at the end
		return [...preferred, ...regular, ...reddit];
	});

	// State
	let showAllSources = $.state(true);

	let visibleSources = $.state($.proxy(typeof window !== 'undefined' && window.innerWidth <= 768 ? 4 : 8));

	// Handle window resize
	if (typeof window !== 'undefined') {
		window.addEventListener('resize', () => {
			$.set(visibleSources, window.innerWidth <= 768 ? 4 : 8, true);
		});
	}

	// Calculate publisher and article counts
	let publisherCount = $.derived(() => $.get(sortedDomains).length);

	let totalArticleCount = $.derived(() => $$props.articles?.length || 0);

	// Get the most recent article URL for a domain
	function getMostRecentArticleUrl(domain) {
		const domainArticles = $$props.articles?.filter((a) => a.domain === domain?.name) || [];

		if (domainArticles.length === 0) return undefined;

		// Sort by date descending and get the first one
		const sorted = [...domainArticles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

		return sorted[0]?.link;
	}

	// Handle source click - opens overlay on regular click
	async function handleSourceClick(event, domain) {
		// Allow middle-click, ctrl-click, cmd-click to work naturally as links
		if (event.button === 1 || event.ctrlKey || event.metaKey) {
			return; // Let the default anchor behavior handle it
		}

		// For regular left-click, prevent navigation and open overlay
		event.preventDefault();

		currentSource(domain);
		sourceArticles($$props.articles.filter((a) => a.domain === domain?.name) || []);
		currentMediaInfo(null);
		isLoadingMediaInfo(true);

		// Fetch media info for this specific domain
		if (domain?.name) {
			try {
				const mediaInfo = await dataService.loadMediaDataForHost(domain.name, languageSettings.data);

				currentMediaInfo(mediaInfo);
			} catch(error) {
				console.error('Failed to load media info for domain:', domain.name, error);
				currentMediaInfo(null);
			}
		}

		isLoadingMediaInfo(false);
		showSourceOverlay(true);
	}

	var section = root_3();
	var div = $.child(section);
	var div_1 = $.child(div);
	var h3 = $.child(div_1);
	var text = $.only_child(h3, true);
	var p = $.sibling(h3, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var button = root();
			var svg = $.child(button);
			let classes;

			$.reset(button);

			$.template_effect(
				($0) => {
					$.set_attribute(button, 'aria-label', $0);
					$.set_attribute(button, 'aria-expanded', $.get(showAllSources));
					classes = $.set_class(svg, 0, 'ms-1 inline-block h-5 w-5 transform transition-transform duration-200', null, classes, { 'rotate-180': $.get(showAllSources) });
				},
				[
					() => $.get(showAllSources)
						? storyLocalizer()("sources.showFewer.aria", { count: $.get(sortedDomains).length.toString() }) || `Show fewer sources (${$.get(sortedDomains).length} total)`
						: storyLocalizer()("sources.showAll.aria", { count: $.get(sortedDomains).length.toString() }) || `Show all ${$.get(sortedDomains).length} sources`
				]
			);

			$.delegated('click', button, () => $.set(showAllSources, !$.get(showAllSources)));
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if ($.get(sortedDomains).length > $.get(visibleSources)) $$render(consequent);
		});
	}

	$.reset(div);

	var div_2 = $.sibling(div, 2);

	$.each(div_2, 21, () => $.get(sortedDomains), $.index, ($$anchor, domain, index) => {
		var fragment = $.comment();
		var node_1 = $.first_child(fragment);

		{
			var consequent_4 = ($$anchor) => {
				var a_1 = root_2();
				var div_3 = $.child(a_1);
				var node_2 = $.child(div_3);

				{
					let $0 = $.derived(() => $.get(domain)?.name || "");
					let $1 = $.derived(() => $.get(domain)?.name ? `${$.get(domain).name} Favicon` : "Default Favicon");

					FaviconImage(node_2, {
						get domain() {
							return $.get($0);
						},

						get alt() {
							return $.get($1);
						},
						class: 'h-5 w-5 rounded-sm',
						loading: 'lazy'
					});
				}

				var span = $.sibling(node_2, 2);
				var text_2 = $.only_child(span, true);
				var node_3 = $.sibling(span, 2);

				{
					var consequent_1 = ($$anchor) => {
						{
							let $0 = $.derived(() => storyLocalizer()("sources.paywallTooltip") || "This source may require a subscription to access full articles");

							Tooltip($$anchor, {
								get text() {
									return $.get($0);
								},
								position: 'top',
								children: ($$anchor, $$slotProps) => {
									var span_1 = root_1();
									var node_4 = $.child(span_1);

									IconLock(node_4, { class: 'h-3.5 w-3.5 text-gray-400 dark:text-gray-500' });
									$.reset(span_1);
									$.template_effect(($0) => $.set_attribute(span_1, 'aria-label', $0), [() => storyLocalizer()("sources.paywall") || "Paywall"]);
									$.append($$anchor, span_1);
								},
								$$slots: { default: true }
							});
						}
					};

					$.if(node_3, ($$render) => {
						if ($.get(domain)?.isPaywalled) $$render(consequent_1);
					});
				}

				$.reset(div_3);

				var span_2 = $.sibling(div_3, 2);
				var node_5 = $.child(span_2);

				{
					var consequent_3 = ($$anchor) => {
						const articleCount = $.derived(() => $$props.articles.filter((a) => a.domain === $.get(domain)?.name).length);
						const mostRecentDate = $.derived(() => getMostRecentArticleDate($$props.articles, $.get(domain)?.name));
						var fragment_2 = $.comment();
						var node_6 = $.first_child(fragment_2);

						{
							var consequent_2 = ($$anchor) => {
								var text_3 = $.text();

								$.template_effect(($0, $1) => $.set_text(text_3, `${$0 ?? ''} · ${$1 ?? ''}`), [
									() => getTimeAgo($.get(mostRecentDate)),
									() => $.get(articleCount) === 1
										? storyLocalizer()("sources.article", { count: $.get(articleCount).toString() })
										: storyLocalizer()("sources.articles", { count: $.get(articleCount).toString() })
								]);

								$.append($$anchor, text_3);
							};

							var alternate = ($$anchor) => {
								var text_4 = $.text();

								$.template_effect(($0) => $.set_text(text_4, $0), [
									() => $.get(articleCount) === 1
										? storyLocalizer()("sources.article", { count: $.get(articleCount).toString() })
										: storyLocalizer()("sources.articles", { count: $.get(articleCount).toString() })
								]);

								$.append($$anchor, text_4);
							};

							$.if(node_6, ($$render) => {
								if ($.get(mostRecentDate) && $.get(articleCount) > 0) $$render(consequent_2); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_2);
					};

					var alternate_1 = ($$anchor) => {
						var text_5 = $.text();

						$.template_effect(($0) => $.set_text(text_5, $0), [() => storyLocalizer()("sources.articles", { count: "0" })]);
						$.append($$anchor, text_5);
					};

					$.if(node_5, ($$render) => {
						if ($$props.articles) $$render(consequent_3); else $$render(alternate_1, -1);
					});
				}

				$.reset(span_2);
				$.reset(a_1);

				$.template_effect(
					($0, $1) => {
						$.set_attribute(a_1, 'href', $0);
						$.set_attribute(a_1, 'aria-label', $1);
						$.set_text(text_2, $.get(domain)?.name || "Unknown");
						span.dir = span.dir;
					},
					[
						() => getMostRecentArticleUrl($.get(domain)) || '#',
						() => (() => {
							const count = $$props.articles?.filter((a) => a.domain === $.get(domain)?.name).length || 0;

							return count > 0
								? `View ${count} ${count === 1 ? 'article' : 'articles'} from ${$.get(domain)?.name || 'Unknown'}`
								: `View articles from ${$.get(domain)?.name || 'Unknown'}`;
						})()
					]
				);

				$.delegated('click', a_1, (e) => handleSourceClick(e, $.get(domain)));
				$.append($$anchor, a_1);
			};

			$.if(node_1, ($$render) => {
				if (index < $.get(visibleSources) || $.get(showAllSources)) $$render(consequent_4);
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(div_2);
	$.reset(section);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
		},
		[
			() => storyLocalizer()("section.sources") || "Sources",
			() => storyLocalizer()("sources.summary", {
				publishers: $.get(publisherCount).toString(),
				articles: $.get(totalArticleCount).toString()
			})
		]
	);

	$.append($$anchor, section);
	$.pop();
}

$.delegate(['click']);