import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';
import { displaySettings, languageSettings, themeSettings } from '$lib/data/settings.svelte.js';

var root = $.from_html(`<footer class="mt-8 pt-4 pb-8 md:pb-4"><div><a href="https://github.com/kagisearch/kite-public" target="_blank" class="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"><svg class="h-5 w-5 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg> <span class="text-xs sm:text-sm"> </span></a> <button class="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"><img class="h-5 w-5"/> <span class="text-xs sm:text-sm"><span class="sm:hidden"> </span> <span class="hidden sm:inline"> </span></span></button> <a target="_blank" class="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"><img src="/svg/rss.svg" alt="" class="h-5 w-5 dark:invert"/> <span class="text-xs sm:text-sm"><span class="sm:hidden"> </span> <span class="hidden sm:inline"> </span></span></a></div></footer>`);

export default function Footer($$anchor, $$props) {
	$.push($$props, true);

	// Helper function for layout width class
	function getContainerWidthClass() {
		switch (displaySettings.layoutWidth) {
			case 'wide':
				return 'max-w-4xl';

			case 'full':
				return 'max-w-full';

			default:
				return 'max-w-[732px]';
		}
	}

	let currentCategory = $.prop($$props, 'currentCategory', 3, 'World'),
		categories = $.prop($$props, 'categories', 19, () => []),
		stories = $.prop($$props, 'stories', 19, () => []);

	// Handle about click
	function handleAboutClick() {
		// Push /about to the URL
		window.history.pushState({}, '', '/about');

		if ($$props.onShowAbout) $$props.onShowAbout();
	}

	// Get RSS feed URL - uses the language currently loaded for stories
	function getRSSFeedUrl() {
		const categoryLower = currentCategory().toLowerCase();

		// Get the language from the first story (all stories in a category use the same language)
		const selectedLanguage = stories()[0]?.selectedLanguage;

		// Use the selected language for RSS feed
		if (selectedLanguage && selectedLanguage !== 'en') {
			return `/${categoryLower}_${selectedLanguage}.xml`;
		}

		return `/${categoryLower}.xml`;
	}

	var footer = root();
	var div = $.child(footer);
	var a = $.child(div);
	var span = $.sibling($.child(a), 2);
	var text = $.only_child(span, true);

	$.reset(a);

	var button = $.sibling(a, 2);
	var img = $.child(button);

	$.set_attribute(img, 'src', "/favicon.svg");

	var span_1 = $.sibling(img, 2);
	var span_2 = $.child(span_1);
	var text_1 = $.only_child(span_2, true);
	var span_3 = $.sibling(span_2, 2);
	var text_2 = $.only_child(span_3, true);

	$.reset(span_1);
	$.reset(button);

	var a_1 = $.sibling(button, 2);
	var span_4 = $.sibling($.child(a_1), 2);
	var span_5 = $.child(span_4);
	var text_3 = $.only_child(span_5, true);
	var span_6 = $.sibling(span_5, 2);
	var text_4 = $.only_child(span_6, true);

	$.reset(span_4);
	$.reset(a_1);
	$.reset(div);
	$.reset(footer);

	$.template_effect(
		($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) => {
			$.set_class(div, 1, `container mx-auto flex ${$0 ?? ''} items-center justify-center space-x-3 sm:space-x-6 px-4`);
			$.set_attribute(a, 'title', $1);
			$.set_text(text, $2);
			$.set_attribute(button, 'title', $3);
			$.set_attribute(img, 'alt', $4);
			$.set_text(text_1, $5);
			$.set_text(text_2, $6);
			$.set_attribute(a_1, 'href', $7);
			$.set_attribute(a_1, 'title', $8);
			$.set_text(text_3, $9);
			$.set_text(text_4, $10);
		},
		[
			() => getContainerWidthClass(),
			() => s("footer.contribute") || "Contribute to Kagi News",
			() => s("footer.contribute") || "Contribute",
			() => s("footer.about") || "About Kagi News",
			() => s("app.logo.iconAlt") || "Kagi News",
			() => s("footer.aboutMobile") || "About",
			() => s("footer.about") || "About Kagi News",
			() => getRSSFeedUrl(),
			() => s("footer.rssFeed") || "RSS feed",
			() => s("footer.rssFeedMobile") || "RSS",
			() => s("footer.rssFeed") || "RSS Feed"
		]
	);

	$.delegated('click', button, handleAboutClick);
	$.append($$anchor, footer);
	$.pop();
}

$.delegate(['click']);