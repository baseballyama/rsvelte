import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconKeyboard } from '@tabler/icons-svelte';
import { s } from '$lib/client/localization.svelte';
import { settingsModalState, themeSettings } from '$lib/data/settings.svelte.js';
import { keyboardNavigation } from '$lib/stores/keyboardNavigation.svelte';
import { language } from '$lib/stores/language.svelte';

var root = $.from_html(`<div class="space-y-6"><div class="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-xl border border-blue-100 dark:border-blue-700/50"><div class="flex flex-col sm:flex-row items-start gap-6"><div class="flex-shrink-0"><img src="/doggo_default.svg" alt="Kagi Doggo" class="size-24 object-contain"/></div> <div class="flex-1 space-y-3"><h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100"> </h3> <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"> </p> <button class="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors focus-visible-ring rounded"><span> </span> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button></div></div></div> <div class="space-y-3"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300"> </h3> <div class="ps-2"><p class="text-sm text-gray-600 dark:text-gray-400 mb-3"> </p> <button class="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus-visible-ring"><!> <span> </span> <kbd class="ms-2 px-1.5 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 rounded">?</kbd></button></div></div> <div class="space-y-3"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300"> </h3> <div class="ps-2"><p class="text-sm text-gray-600 dark:text-gray-400 mb-3"> </p> <a href="/api-docs" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-600 focus-visible-ring"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg> <span> </span></a></div></div> <div class="space-y-3"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300"> </h3> <div class="ps-2"><p class="text-sm text-gray-600 dark:text-gray-400 mb-3"> </p> <div class="flex flex-col sm:flex-row gap-3 items-center"><a href="https://apps.apple.com/us/app/kagi-news/id6748314243" target="_blank" rel="noopener noreferrer" class="inline-flex items-center hover:opacity-80 transition-opacity focus-visible-ring rounded-lg"><img class="h-[40px] w-auto" style="min-width: 120px;"/></a> <a href="https://play.google.com/store/apps/details?id=com.kagi.news" target="_blank" rel="noopener noreferrer" class="inline-flex items-center hover:opacity-80 transition-opacity focus-visible-ring rounded-lg"><img style="min-width: 120px;"/></a></div></div></div> <div class="ps-2 pt-4 border-t border-gray-200 dark:border-gray-700"><p class="text-xs text-gray-500 dark:text-gray-400"> </p></div></div>`);

export default function SettingsAbout($$anchor, $$props) {
	$.push($$props, true);

	function showKeyboardShortcuts() {
		// Close settings modal first, then show keyboard help
		settingsModalState.isOpen = false;

		// Small delay to allow modal to close
		setTimeout(
			() => {
				keyboardNavigation.openHelp();
			},
			100
		);
	}

	function showAbout() {
		// Push /about to the URL
		window.history.pushState({}, '', '/about');

		if ($$props.onShowAbout) $$props.onShowAbout();
	}

	// Map Kite locale codes to App Store badge folder names
	const localeToAppStoreBadge = {
		ar: 'AR',
		de: 'DE',
		en: 'US',
		es: 'ES',
		fr: 'FR',
		he: 'IL',
		hi: 'IN',
		it: 'IT',
		ja: 'JP',
		nl: 'NL',
		pt: 'PTPT',
		'pt-BR': 'PTBR',
		ru: 'RU',
		uk: 'UA',
		'zh-Hans': 'CN(SC)',
		'zh-Hant': 'HKTW(TC)'
	};

	// Google Play badges use locale codes directly (ar, de, en, etc.)
	const supportedGooglePlayLocales = [
		'ar',
		'de',
		'en',
		'es',
		'fr',
		'he',
		'hi',
		'it',
		'ja',
		'nl',
		'pt',
		'pt-BR',
		'ru',
		'uk',
		'zh-Hans',
		'zh-Hant'
	];

	// Some locales have extra padding in their badge SVGs and need to be scaled up
	const badgesWithExtraPadding = ['en', 'he', 'ja', 'ru'];

	// Get the appropriate badges based on current locale and theme
	const appStoreBadgeFolder = $.derived(() => localeToAppStoreBadge[language.current] || 'US');

	const appStoreBadgeVariant = $.derived(() => themeSettings.theme === 'dark' ? 'white' : 'black');
	const appStoreBadgePath = $.derived(() => `/badges/app-store/${$.get(appStoreBadgeFolder)}/${$.get(appStoreBadgeVariant)}.svg`);
	const googlePlayLocale = $.derived(() => supportedGooglePlayLocales.includes(language.current) ? language.current : 'en');
	const googlePlayBadgeExt = $.derived(() => ['pt', 'pt-BR', 'zh-Hans'].includes($.get(googlePlayLocale)) ? 'png' : 'svg');
	const googlePlayBadgePath = $.derived(() => `/badges/google-play/${$.get(googlePlayLocale)}.${$.get(googlePlayBadgeExt)}`);
	const googlePlayNeedsScaling = $.derived(() => badgesWithExtraPadding.includes($.get(googlePlayLocale)));
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.sibling($.child(div_2), 2);
	var h3 = $.child(div_3);
	var text = $.only_child(h3, true);
	var p = $.sibling(h3, 2);
	var text_1 = $.only_child(p, true);
	var button = $.sibling(p, 2);
	var span = $.child(button);
	var text_2 = $.only_child(span, true);

	$.next(2);
	$.reset(button);
	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var h3_1 = $.child(div_4);
	var text_3 = $.only_child(h3_1, true);
	var div_5 = $.sibling(h3_1, 2);
	var p_1 = $.child(div_5);
	var text_4 = $.only_child(p_1, true);
	var button_1 = $.sibling(p_1, 2);
	var node = $.child(button_1);

	IconKeyboard(node, { size: 18 });

	var span_1 = $.sibling(node, 2);
	var text_5 = $.only_child(span_1, true);

	$.next(2);
	$.reset(button_1);
	$.reset(div_5);
	$.reset(div_4);

	var div_6 = $.sibling(div_4, 2);
	var h3_2 = $.child(div_6);
	var text_6 = $.only_child(h3_2, true);
	var div_7 = $.sibling(h3_2, 2);
	var p_2 = $.child(div_7);
	var text_7 = $.only_child(p_2, true);
	var a = $.sibling(p_2, 2);
	var span_2 = $.sibling($.child(a), 2);
	var text_8 = $.only_child(span_2, true);

	$.reset(a);
	$.reset(div_7);
	$.reset(div_6);

	var div_8 = $.sibling(div_6, 2);
	var h3_3 = $.child(div_8);
	var text_9 = $.only_child(h3_3, true);
	var div_9 = $.sibling(h3_3, 2);
	var p_3 = $.child(div_9);
	var text_10 = $.only_child(p_3, true);
	var div_10 = $.sibling(p_3, 2);
	var a_1 = $.child(div_10);
	var img = $.only_child(a_1);
	var a_2 = $.sibling(a_1, 2);
	var img_1 = $.only_child(a_2);

	$.reset(div_10);
	$.reset(div_9);
	$.reset(div_8);

	var div_11 = $.sibling(div_8, 2);
	var p_4 = $.child(div_11);
	var text_11 = $.only_child(p_4);

	$.reset(div_11);
	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
			$.set_text(text_2, $2);
			$.set_text(text_3, $3);
			$.set_text(text_4, $4);
			$.set_text(text_5, $5);
			$.set_text(text_6, $6);
			$.set_text(text_7, $7);
			$.set_text(text_8, $8);
			$.set_text(text_9, $9);
			$.set_text(text_10, $10);
			$.set_attribute(img, 'src', $.get(appStoreBadgePath));
			$.set_attribute(img, 'alt', $11);
			$.set_attribute(img_1, 'src', $.get(googlePlayBadgePath));
			$.set_attribute(img_1, 'alt', $12);
			$.set_class(img_1, 1, $.clsx($.get(googlePlayNeedsScaling) ? 'h-[60px] w-auto' : 'h-[40px] w-auto'));
			$.set_text(text_11, `© ${$13 ?? ''} Kagi Inc.`);
		},
		[
			() => s('settings.about.aboutKite') || 'About Kite',
			() => s('settings.about.description') || 'Kite is a news aggregator that clusters stories from multiple sources, helping you see different perspectives on the same event. Available in 15+ languages with automatic translation.',
			() => s('settings.about.learnMore') || 'Learn more',
			() => s('settings.about.keyboardShortcuts') || 'Keyboard Shortcuts',
			() => s('settings.about.keyboardDescription') || 'Navigate stories and categories using vim-style keyboard shortcuts',
			() => s('settings.about.viewShortcuts') || 'View Keyboard Shortcuts',
			() => s('settings.about.apiAccess') || 'API Access',
			() => s('settings.about.apiDescription') || 'Access Kite news programmatically with our REST API',
			() => s('settings.about.viewApiDocs') || 'View API Documentation',
			() => s('settings.about.mobileApps') || 'Mobile Apps',
			() => s('settings.about.mobileDescription') || 'Get Kite on your mobile device',
			() => s('settings.about.downloadIos') || 'Download on the App Store',
			() => s('settings.about.downloadAndroid') || 'Get it on Google Play',
			() => new Date().getFullYear()
		]
	);

	$.delegated('click', button, showAbout);
	$.delegated('click', button_1, showKeyboardShortcuts);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);