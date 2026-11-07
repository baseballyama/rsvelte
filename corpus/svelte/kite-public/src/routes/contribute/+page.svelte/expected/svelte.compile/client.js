import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	IconArrowLeft,
	IconBrandGithub,
	IconExternalLink,
	IconInfoCircle
} from '@tabler/icons-svelte';

import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import ContributeCategoryStep from '$lib/components/contribute/ContributeCategoryStep.svelte';
import ContributeFeedStep from '$lib/components/contribute/ContributeFeedStep.svelte';
import ContributeHistory from '$lib/components/contribute/ContributeHistory.svelte';
import ContributeOnboarding from '$lib/components/contribute/ContributeOnboarding.svelte';
import ContributeSubmitStep from '$lib/components/contribute/ContributeSubmitStep.svelte';

import {
	deduplicateFeeds,
	generateManualPrSnippet,
	parseCoreFeedsPy,
	parseFeedUrls
} from '$lib/utils/feedContribution';

var root = $.from_html(`<div class="min-h-screen bg-app-bg"><header class="bg-modal-bg border-b border-primary-200"><div class="max-w-3xl mx-auto px-4 py-6"><div class="flex items-center gap-4"><a href="/" class="flex items-center gap-2 text-primary-400 hover:text-primary-600 transition-colors"><!> <img src="/favicon.svg" alt="Kagi News" class="w-8 h-8"/></a> <div class="flex-1"><h1 class="text-2xl font-bold text-primary"> </h1> <p class="text-sm text-primary-600"> </p></div> <button class="text-xs text-primary-400 hover:text-primary-600 transition-colors inline-flex items-center gap-1"><!> </button></div></div></header> <main class="max-w-3xl mx-auto px-4 py-8 space-y-6"><!> <!> <!> <!> <div class="text-center text-xs text-primary-400 pt-4 pb-8"><a href="https://github.com/kagisearch/kite-public" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 hover:text-primary-600"><!> kagisearch/kite-public <!></a></div></main></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const FEEDS_URL = 'https://raw.githubusercontent.com/kagisearch/kite-public/main/kite_feeds.json';
	const CORE_FEEDS_URL = 'https://raw.githubusercontent.com/kagisearch/kite-public/main/core_feeds.py';

	// Props from +page.server.ts
	// State: onboarding (SSR-safe via cookie)
	let showOnboarding = $.state(!$$props.data.hasSeenOnboarding);

	// State: data loading
	let feedsData = $.state(null);

	let communityFeedsData = $.state(null);
	let loadingFeeds = $.state(true);
	let loadError = $.state(null);

	// State: category selection
	let mode = $.state('existing');

	let selectedCategory = $.state('');
	let newCategoryName = $.state('');
	let newCategoryLanguage = $.state('en');
	let showExistingFeeds = $.state(false);

	// State: feed input
	let addedFeeds = $.state($.proxy([]));

	let duplicateFeeds = $.state($.proxy([]));
	let parseError = $.state(null);

	// State: validation queue
	let validationQueue = $.state($.proxy([]));

	let activeValidations = $.state(0);
	const MAX_CONCURRENT_VALIDATIONS = 2;

	// State: pending PRs
	let pendingPrs = $.state($.proxy([]));

	// State: submission
	let isSubmitting = $.state(false);

	let submitResult = $.state(null);

	// Derived
	const currentCategoryData = $.derived(() => $.get(feedsData) && $.get(selectedCategory) ? $.get(feedsData)[$.get(selectedCategory)] : null);

	const activeCategoryName = $.derived(() => $.get(mode) === 'existing'
		? $.get(selectedCategory)
		: $.get(newCategoryName).trim());

	const validFeeds = $.derived(() => $.get(addedFeeds).filter((f) => f.status === 'valid'));
	const errorFeeds = $.derived(() => $.get(addedFeeds).filter((f) => f.status === 'error'));
	const unknownFeeds = $.derived(() => $.get(addedFeeds).filter((f) => f.status === 'unknown'));
	const pendingFeeds = $.derived(() => $.get(addedFeeds).filter((f) => f.status === 'pending' || f.status === 'checking'));
	const submittableFeeds = $.derived(() => $.get(addedFeeds).filter((f) => f.status !== 'error'));
	const allErrored = $.derived(() => $.get(addedFeeds).length > 0 && $.get(pendingFeeds).length === 0 && $.get(submittableFeeds).length === 0);
	const canSubmit = $.derived(() => $.get(activeCategoryName).length > 0 && $.get(submittableFeeds).length > 0 && $.get(pendingFeeds).length === 0 && !$.get(allErrored));

	const selectedPendingNewCategory = $.derived(() => $.get(mode) === 'existing'
		? $.get(pendingPrs).find((pr) => pr.isNew && pr.categoryName === $.get(selectedCategory) && ($.get(feedsData) ? !$.get(feedsData)[pr.categoryName] : true)) || null
		: null);

	const effectiveIsNew = $.derived(() => $.get(mode) === 'new' || $.get(selectedPendingNewCategory) !== null);

	// Find related pending PR for the selected category (if any)
	const relatedPendingPr = $.derived(() => $.get(mode) === 'existing'
		? $.get(pendingPrs).find((pr) => pr.categoryName === $.get(selectedCategory))
		: null);

	// Fetch feeds data and pending PRs on mount
	$.user_effect(() => {
		if (browser && !$.get(feedsData)) {
			loadFeedsData();
			loadPendingPrs();
		}
	});

	// Process validation queue
	$.user_effect(() => {
		if ($.get(validationQueue).length > 0 && $.get(activeValidations) < MAX_CONCURRENT_VALIDATIONS) {
			const url = $.get(validationQueue)[0];

			$.set(validationQueue, $.get(validationQueue).slice(1), true);
			validateFeed(url);
		}
	});

	function handleOnboardingComplete() {
		if (browser) {
			// biome-ignore lint/suspicious/noDocumentCookie: simple cookie set, Cookie Store API has poor browser support
			document.cookie = 'kite-contribute-seen=1; path=/; max-age=31536000; SameSite=Lax';
		}

		$.set(showOnboarding, false);
	}

	async function loadFeedsData() {
		$.set(loadingFeeds, true);
		$.set(loadError, null);

		try {
			// Fetch community feeds and core feeds in parallel
			const [communityResponse, coreResponse] = await Promise.all([fetch(FEEDS_URL), fetch(CORE_FEEDS_URL).catch(() => null)]);

			if (!communityResponse.ok) {
				throw new Error(`Failed to load feeds: ${communityResponse.status}`);
			}

			const communityData = await communityResponse.json();

			$.set(communityFeedsData, { ...communityData }, true);

			// Parse core feeds and merge (core categories that already exist in community are skipped)
			if (coreResponse?.ok) {
				const corePyContent = await coreResponse.text();
				const coreData = parseCoreFeedsPy(corePyContent);

				for (const [name, category] of Object.entries(coreData)) {
					if (!communityData[name]) {
						communityData[name] = category;
					}
				}
			}

			$.set(feedsData, communityData, true);
		} catch(e) {
			$.set(loadError, e instanceof Error ? e.message : 'Failed to load feeds data', true);
		} finally {
			$.set(loadingFeeds, false);
		}
	}

	async function loadPendingPrs() {
		try {
			const response = await fetch('/api/contribute/pending-prs');

			if (response.ok) {
				$.set(pendingPrs, await response.json(), true);
			}
		} catch {
			// Non-critical — silently fail
		}
	}

	function handleAddFeeds(input) {
		$.set(parseError, null);

		const parsed = parseFeedUrls(input);

		// Check if input had text but no valid URLs
		const lines = input.split(/[\s,]+/).map((line) => line.trim()).filter((line) => line.length > 0);

		if (parsed.length === 0 && lines.length > 0) {
			$.set(parseError, s('contribute.noValidUrls'), true);

			return false;
		}

		// Deduplicate against existing category feeds and already-added feeds
		const existingUrls = [
			...$.get(currentCategoryData)?.feeds || [],
			...$.get(addedFeeds).map((f) => f.url)
		];

		const { unique, duplicates: dupes } = deduplicateFeeds(parsed, existingUrls);

		if (dupes.length > 0) {
			$.set(duplicateFeeds, [...new Set([...$.get(duplicateFeeds), ...dupes])], true);
		}

		if (unique.length === 0 && dupes.length > 0) {
			$.set(parseError, s('contribute.allDuplicates', { count: String(dupes.length) }), true);

			return false;
		}

		if (unique.length === 0) {
			return false;
		}

		// Add to feed list as pending
		const newResults = unique.map((url) => ({ url, status: 'pending' }));

		$.set(addedFeeds, [...$.get(addedFeeds), ...newResults], true);

		// Queue for validation
		$.set(validationQueue, [...$.get(validationQueue), ...unique], true);

		return true;
	}

	async function validateFeed(url) {
		$.update(activeValidations);

		// Mark as checking
		$.set(addedFeeds, $.get(addedFeeds).map((f) => f.url === url ? { ...f, status: 'checking' } : f), true);

		try {
			const response = await fetch(`/api/feed-check?url=${encodeURIComponent(url)}`);
			const result = await response.json();

			$.set(
				addedFeeds,
				$.get(addedFeeds).map((f) => f.url === url
					? {
						...f,
						status: result.status || (response.ok ? 'unknown' : 'error'),
						contentType: result.contentType,
						statusCode: result.statusCode || response.status,
						error: result.error || result.message || (!response.ok ? `HTTP ${response.status}` : undefined)
					}
					: f),
				true
			);
		} catch {
			$.set(
				addedFeeds,
				$.get(addedFeeds).map((f) => f.url === url
					? { ...f, status: 'unknown', error: 'Network error' }
					: f),
				true
			);
		} finally {
			$.update(activeValidations, -1);
		}
	}

	function removeFeed(url) {
		$.set(addedFeeds, $.get(addedFeeds).filter((f) => f.url !== url), true);
		$.set(validationQueue, $.get(validationQueue).filter((u) => u !== url), true);
	}

	function removeAllErrored() {
		const errorUrls = new Set($.get(errorFeeds).map((f) => f.url));

		$.set(addedFeeds, $.get(addedFeeds).filter((f) => !errorUrls.has(f.url)), true);
	}

	function handleModeChange(newMode) {
		$.set(mode, newMode, true);
		resetForm();
	}

	function handleCategoryChange(value) {
		$.set(selectedCategory, value, true);
		$.set(addedFeeds, [], true);
		$.set(duplicateFeeds, [], true);
		$.set(showExistingFeeds, false);
		$.set(submitResult, null);
		$.set(parseError, null);
	}

	async function handleSubmit() {
		if (!$.get(canSubmit)) return;

		// Manual mode: generate snippet client-side, no API call
		if (($$props.data.githubMode ?? 'manual') === 'manual') {
			const feedsToSubmit = $.get(submittableFeeds).map((f) => f.url);
			const isCore = $.get(currentCategoryData)?.category_type === 'core';

			const snippet = generateManualPrSnippet({
				category: $.get(activeCategoryName),
				isNew: $.get(effectiveIsNew),
				feeds: feedsToSubmit,
				sourceLanguage: $.get(mode) === 'new' ? $.get(newCategoryLanguage) : undefined,
				isCore,
				communityFeedsData: $.get(communityFeedsData) ?? undefined
			});

			$.set(submitResult, { type: 'manual', message: '', snippet }, true);

			return;
		}

		$.set(isSubmitting, true);
		$.set(submitResult, null);

		const feedsToSubmit = $.get(submittableFeeds).map((f) => f.url);

		try {
			const response = await fetch('/api/contribute', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					category: $.get(activeCategoryName),
					isNew: $.get(effectiveIsNew),
					sourceLanguage: $.get(mode) === 'new' ? $.get(newCategoryLanguage) : undefined,
					feeds: feedsToSubmit,
					relatedPr: $.get(relatedPendingPr)?.prNumber
				})
			});

			const result = await response.json();

			if (result.success) {
				$.set(
					submitResult,
					{
						type: 'success',
						message: s('contribute.successMessage', { prNumber: String(result.prNumber) }),
						prUrl: result.prUrl
					},
					true
				);

				await loadPendingPrs();
			} else {
				$.set(
					submitResult,
					{
						type: 'error',
						message: result.message || s('contribute.failedPr')
					},
					true
				);
			}
		} catch {
			$.set(submitResult, { type: 'error', message: s('contribute.networkError') }, true);
		} finally {
			$.set(isSubmitting, false);
		}
	}

	function resetForm() {
		$.set(addedFeeds, [], true);
		$.set(duplicateFeeds, [], true);
		$.set(submitResult, null);
		$.set(parseError, null);

		if ($.get(mode) === 'new') {
			$.set(newCategoryName, '');
		}
	}

	var fragment = $.comment();

	$.head('1iapvv4', ($$anchor) => {
		$.deferred_template_effect(
			($0) => {
				$.document.title = $0 ?? '';
			},
			[() => s('contribute.pageTitle')]
		);
	});

	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			ContributeOnboarding($$anchor, { onComplete: handleOnboardingComplete });
		};

		var alternate = ($$anchor) => {
			var div = root();
			var header = $.child(div);
			var div_1 = $.child(header);
			var div_2 = $.child(div_1);
			var a = $.child(div_2);
			var node_1 = $.child(a);

			IconArrowLeft(node_1, { size: 20 });
			$.next(2);
			$.reset(a);

			var div_3 = $.sibling(a, 2);
			var h1 = $.child(div_3);
			var text = $.only_child(h1, true);
			var p = $.sibling(h1, 2);
			var text_1 = $.only_child(p, true);

			$.reset(div_3);

			var button = $.sibling(div_3, 2);
			var node_2 = $.child(button);

			IconInfoCircle(node_2, { size: 14 });

			var text_2 = $.sibling(node_2);

			$.reset(button);
			$.reset(div_2);
			$.reset(div_1);
			$.reset(header);

			var main = $.sibling(header, 2);
			var node_3 = $.child(main);

			{
				var consequent_1 = ($$anchor) => {
					ContributeHistory($$anchor, {
						get contributions() {
							return $$props.data.contributions;
						}
					});
				};

				$.if(node_3, ($$render) => {
					if ($$props.data.contributions?.length > 0) $$render(consequent_1);
				});
			}

			var node_4 = $.sibling(node_3, 2);

			ContributeCategoryStep(node_4, {
				get feedsData() {
					return $.get(feedsData);
				},

				get loadingFeeds() {
					return $.get(loadingFeeds);
				},

				get loadError() {
					return $.get(loadError);
				},

				get pendingPrs() {
					return $.get(pendingPrs);
				},
				onModeChange: handleModeChange,
				onCategoryChange: handleCategoryChange,
				onLoadRetry: loadFeedsData,
				get mode() {
					return $.get(mode);
				},

				set mode($$value) {
					$.set(mode, $$value, true);
				},

				get selectedCategory() {
					return $.get(selectedCategory);
				},

				set selectedCategory($$value) {
					$.set(selectedCategory, $$value, true);
				},

				get newCategoryName() {
					return $.get(newCategoryName);
				},

				set newCategoryName($$value) {
					$.set(newCategoryName, $$value, true);
				},

				get newCategoryLanguage() {
					return $.get(newCategoryLanguage);
				},

				set newCategoryLanguage($$value) {
					$.set(newCategoryLanguage, $$value, true);
				},

				get showExistingFeeds() {
					return $.get(showExistingFeeds);
				},

				set showExistingFeeds($$value) {
					$.set(showExistingFeeds, $$value, true);
				}
			});

			var node_5 = $.sibling(node_4, 2);

			{
				var consequent_2 = ($$anchor) => {
					ContributeFeedStep($$anchor, {
						get addedFeeds() {
							return $.get(addedFeeds);
						},

						get duplicateFeeds() {
							return $.get(duplicateFeeds);
						},

						get validFeeds() {
							return $.get(validFeeds);
						},

						get errorFeeds() {
							return $.get(errorFeeds);
						},

						get unknownFeeds() {
							return $.get(unknownFeeds);
						},

						get pendingFeeds() {
							return $.get(pendingFeeds);
						},

						get allErrored() {
							return $.get(allErrored);
						},

						get parseError() {
							return $.get(parseError);
						},
						onAddFeeds: handleAddFeeds,
						onRemoveFeed: removeFeed,
						onRemoveAllErrored: removeAllErrored
					});
				};

				$.if(node_5, ($$render) => {
					if ($.get(activeCategoryName)) $$render(consequent_2);
				});
			}

			var node_6 = $.sibling(node_5, 2);

			{
				var consequent_3 = ($$anchor) => {
					{
						let $0 = $.derived(() => $$props.data.githubMode ?? 'manual');

						ContributeSubmitStep($$anchor, {
							get submitResult() {
								return $.get(submitResult);
							},

							get isSubmitting() {
								return $.get(isSubmitting);
							},

							get canSubmit() {
								return $.get(canSubmit);
							},

							get allErrored() {
								return $.get(allErrored);
							},

							get mode() {
								return $.get(mode);
							},

							get githubMode() {
								return $.get($0);
							},

							get activeCategoryName() {
								return $.get(activeCategoryName);
							},

							get submittableFeeds() {
								return $.get(submittableFeeds);
							},

							get errorFeeds() {
								return $.get(errorFeeds);
							},

							get pendingFeeds() {
								return $.get(pendingFeeds);
							},
							onSubmit: handleSubmit,
							onReset: resetForm
						});
					}
				};

				$.if(node_6, ($$render) => {
					if ($.get(addedFeeds).length > 0) $$render(consequent_3);
				});
			}

			var div_4 = $.sibling(node_6, 2);
			var a_1 = $.child(div_4);
			var node_7 = $.child(a_1);

			IconBrandGithub(node_7, { size: 14 });

			var node_8 = $.sibling(node_7, 2);

			IconExternalLink(node_8, { size: 12 });
			$.reset(a_1);
			$.reset(div_4);
			$.reset(main);
			$.reset(div);

			$.template_effect(
				($0, $1, $2, $3) => {
					$.set_attribute(a, 'aria-label', $0);
					$.set_text(text, $1);
					$.set_text(text_1, $2);
					$.set_text(text_2, ` ${$3 ?? ''}`);
				},
				[
					() => s('common.back'),
					() => s('contribute.heading'),
					() => s('contribute.subtitle'),
					() => s('contribute.howItWorks')
				]
			);

			$.delegated('click', button, () => {
				window.scrollTo({ top: 0, behavior: 'instant' });
				$.set(showOnboarding, true);
			});

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(showOnboarding)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);