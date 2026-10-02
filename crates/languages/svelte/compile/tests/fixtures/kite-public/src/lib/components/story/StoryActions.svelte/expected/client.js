import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { s } from '$lib/client/localization.svelte';
import { languageSettings } from '$lib/data/settings.svelte.js';
import { UrlNavigationService } from '$lib/services/urlNavigationService';
import ReportButton from '../ReportButton.svelte';
import ShareButton from '../ShareButton.svelte';

var root = $.from_html(`<button class="focus:ring-opacity-75 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-gray-800 focus:ring-2 focus:ring-gray-400 focus:outline-none"> </button>`);
var root_1 = $.from_html(`<div class="order-last mt-6 flex w-full items-center justify-center md:px-0"><div class="flex-1 flex justify-start gap-2"><!> <!></div> <!> <div class="flex-1"></div></div>`);

export default function StoryActions($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let batchDateSlug = $.prop($$props, 'batchDateSlug', 3, null),
		isSharedView = $.prop($$props, 'isSharedView', 3, false),
		storyLocalizer = $.prop($$props, 'storyLocalizer', 3, s // Use regular localization if not provided
		);

	// Get current navigation params from URL if not provided
	const navigationParams = $.derived(() => {
		if ($$props.batchId && $$props.categoryId && $$props.storyIndex !== undefined) {
			return {
				batchId: $$props.batchId,
				categoryId: $$props.categoryId,
				storyIndex: $$props.storyIndex,
				dataLang: languageSettings.data
			};
		}

		// Fall back to parsing from current URL
		const params = UrlNavigationService.parseUrl(page.url);

		return {
			batchId: params.batchId || $$props.batchId,
			categoryId: params.categoryId || $$props.categoryId,
			storyIndex: params.storyIndex ?? $$props.storyIndex,
			dataLang: params.dataLang || languageSettings.data
		};
	});

	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => $.get(navigationParams).batchId || '');
		let $1 = $.derived(() => $.get(navigationParams).categoryId || '');

		ShareButton(node, {
			get title() {
				return $$props.story.title;
			},

			get description() {
				return $$props.story.short_summary;
			},

			get batchId() {
				return $.get($0);
			},

			get categoryId() {
				return $.get($1);
			},

			get storyIndex() {
				return $.get(navigationParams).storyIndex;
			},

			get clusterId() {
				return $$props.story.cluster_number;
			},

			get languageCode() {
				return $.get(navigationParams).dataLang;
			},
			class: 'text-gray-600 transition-all duration-200 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			ReportButton($$anchor, {
				get clusterId() {
					return $$props.story.id;
				},

				get title() {
					return $$props.story.title;
				},
				class: 'text-gray-600 transition-all duration-200 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
			});
		};

		$.if(node_1, ($$render) => {
			if ($$props.story.id) $$render(consequent);
		});
	}

	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var button = root();
			var text = $.only_child(button, true);

			$.template_effect(
				($0, $1) => {
					$.set_attribute(button, 'aria-label', $0);
					$.set_text(text, $1);
				},
				[
					() => storyLocalizer()("article.closeStory.aria") || "Close story and return to category list",
					() => storyLocalizer()("article.closeStory") || "Close"
				]
			);

			$.delegated('click', button, function (...$$args) {
				$$props.onClose?.apply(this, $$args);
			});

			$.append($$anchor, button);
		};

		$.if(node_2, ($$render) => {
			if (!isSharedView()) $$render(consequent_1);
		});
	}

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);