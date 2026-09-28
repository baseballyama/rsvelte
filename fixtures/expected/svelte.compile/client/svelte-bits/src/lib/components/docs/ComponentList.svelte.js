import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

import {
	getSavedComponents,
	removeSavedComponent,
	toggleSavedComponent
} from '$lib/utils/favorites';

import { fuzzyMatch } from '$lib/utils/fuzzy';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<button type="button" class="pill-button svelte-l89p71">Clear Filters</button>`);
var root_2 = $.from_html(`<a class="pill-button svelte-l89p71" href="/get-started/index">Browse Components</a>`);
var root_3 = $.from_html(`<div class="component-list-empty svelte-l89p71" role="status"><h2 class="svelte-l89p71"> </h2> <p class="svelte-l89p71"> </p> <!></div>`);
var root_4 = $.from_svg(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>`);
var root_5 = $.from_svg(`<svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"></path></svg>`);
var root_6 = $.from_html(`<div class="component-list-card-wrap svelte-l89p71"><a class="component-list-card svelte-l89p71"><div class="component-list-media-wrap svelte-l89p71"><video loop="" playsinline="" preload="metadata" class="svelte-l89p71"><source type="video/webm"/> <source type="video/mp4"/></video></div> <div class="component-list-card-copy svelte-l89p71"><h2 class="svelte-l89p71"> </h2> <p class="svelte-l89p71"> </p></div></a> <button type="button"><!></button></div>`, 2);
var root_7 = $.from_html(`<div class="component-list-grid svelte-l89p71"></div>`);
var root_8 = $.from_html(`<div class="component-list-page svelte-l89p71"><div class="component-list-header page-transition-fade svelte-l89p71"><h1 class="sub-category svelte-l89p71"> </h1> <div><label class="component-list-search svelte-l89p71"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg> <input placeholder="Search..." class="svelte-l89p71"/></label> <label class="component-list-select svelte-l89p71"><select aria-label="Component category filter" class="svelte-l89p71"></select> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="svelte-l89p71"><polyline points="6 9 12 15 18 9"></polyline></svg></label> <div><button type="button" class="clear-button svelte-l89p71" aria-label="Clear filters"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button></div></div></div> <!></div>`);

export default function ComponentList($$anchor, $$props) {
	$.push($$props, true);

	let hasDeleteButton = $.prop($$props, 'hasDeleteButton', 3, false);
	const CARD_RADIUS = 16;

	const categoryOptions = $.derived(() => [
		'All Components',
		...Array.from(new Set($$props.items.map((item) => item.categoryLabel))).sort((a, b) => a.localeCompare(b))
	]);

	let search = $.state('');
	let selectedCategory = $.state('All Components');
	let hoveredKey = $.state(null);
	let savedSet = $.state($.proxy(new Set()));
	let videoRefs = new Map();

	const filtered = $.derived(() => {
		const term = $.get(search).trim();
		const all = $.get(selectedCategory) === 'All Components';

		return $$props.items.filter((item) => {
			const categoryOk = all || item.categoryLabel === $.get(selectedCategory);

			if (!term) return categoryOk;

			return categoryOk && fuzzyMatch(item.title, term);
		});
	});

	const showClear = $.derived(() => $.get(selectedCategory) !== 'All Components' || $.get(search).trim().length > 0);

	function loadSaved() {
		$.set(savedSet, new Set(getSavedComponents()), true);
	}

	function toggleFavorite(key) {
		const result = toggleSavedComponent(key);

		$.set(savedSet, new Set(result.list), true);
	}

	function removeFavorite(key) {
		$.set(savedSet, new Set(removeSavedComponent(key)), true);
	}

	function clearFilters() {
		$.set(search, '');
		$.set(selectedCategory, 'All Components');
	}

	function setVideo(node, key) {
		videoRefs.set(key, node);

		return {
			destroy() {
				videoRefs.delete(key);
			}
		};
	}

	function handleLoadedMetadata(e) {
		e.currentTarget.currentTime = 0.1;
	}

	$.user_effect(() => {
		if (!$.get(categoryOptions).includes($.get(selectedCategory))) $.set(selectedCategory, 'All Components');
	});

	$.user_effect(() => {
		for (const [key, video] of videoRefs) {
			if (key === $.get(hoveredKey)) {
				const play = video.play();

				if (play && typeof play.catch === 'function') play.catch(() => {});
			} else {
				video.pause();
			}
		}
	});

	onMount(() => {
		loadSaved();

		const onStorage = (e) => {
			if (!e.key || e.key === 'savedComponents') loadSaved();
		};

		const onFavorites = () => loadSaved();

		window.addEventListener('storage', onStorage);
		window.addEventListener('favorites:updated', onFavorites);

		return () => {
			window.removeEventListener('storage', onStorage);
			window.removeEventListener('favorites:updated', onFavorites);
		};
	});

	var div = root_8();
	var div_1 = $.child(div);
	var h1 = $.child(div_1);
	var text = $.only_child(h1, true);
	var div_2 = $.sibling(h1, 2);
	let classes;
	var label = $.child(div_2);
	var input = $.sibling($.child(label), 2);

	$.remove_input_defaults(input);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var select = $.child(label_1);

	$.each(select, 20, () => $.get(categoryOptions), (category) => category, ($$anchor, category) => {
		var option = root();
		var text_1 = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text_1, category);

			if (option_value !== (option_value = category)) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);
	$.next(2);
	$.reset(label_1);

	var div_3 = $.sibling(label_1, 2);
	let classes_1;
	var button = $.only_child(div_3);

	$.reset(div_2);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_4 = root_3();
			var h2 = $.child(div_4);
			var text_2 = $.only_child(h2, true);
			var p = $.sibling(h2, 2);
			var text_3 = $.only_child(p, true);
			var node_2 = $.sibling(p, 2);

			{
				var consequent = ($$anchor) => {
					var button_1 = root_1();

					$.delegated('click', button_1, clearFilters);
					$.append($$anchor, button_1);
				};

				var alternate = ($$anchor) => {
					var a_1 = root_2();

					$.append($$anchor, a_1);
				};

				$.if(node_2, ($$render) => {
					if ($$props.items.length > 0) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div_4);

			$.template_effect(() => {
				$.set_text(text_2, $$props.items.length > 0
					? 'No results...'
					: $$props.emptyTitle ?? 'Nothing here yet...');

				$.set_text(text_3, $$props.items.length > 0
					? 'Try adjusting your filters'
					: $$props.emptyDescription ?? 'Tap the heart on any component to save it');
			});

			$.append($$anchor, div_4);
		};

		var alternate_2 = ($$anchor) => {
			var div_5 = root_7();

			$.set_style(div_5, '', {}, { '--card-radius': `${CARD_RADIUS}px` });

			$.each(div_5, 21, () => $.get(filtered), (item) => item.key, ($$anchor, item) => {
				var div_6 = root_6();
				var a_2 = $.child(div_6);
				var div_7 = $.child(a_2);
				var video_1 = $.child(div_7);

				video_1.muted = true;

				var source = $.child(video_1);
				var source_1 = $.sibling(source, 2);

				$.reset(video_1);
				$.action(video_1, ($$node, $$action_arg) => setVideo?.($$node, $$action_arg), () => $.get(item).key);
				$.reset(div_7);

				var div_8 = $.sibling(div_7, 2);
				var h2_1 = $.child(div_8);
				var text_4 = $.only_child(h2_1, true);
				var p_1 = $.sibling(h2_1, 2);
				var text_5 = $.only_child(p_1, true);

				$.reset(div_8);
				$.reset(a_2);

				var button_2 = $.sibling(a_2, 2);
				let classes_2;
				var node_3 = $.child(button_2);

				{
					var consequent_2 = ($$anchor) => {
						var svg = root_4();

						$.append($$anchor, svg);
					};

					var alternate_1 = ($$anchor) => {
						var svg_1 = root_5();

						$.template_effect(($0) => $.set_attribute(svg_1, 'fill', $0), [
							() => $.get(savedSet).has($.get(item).key) ? 'currentColor' : 'none'
						]);

						$.append($$anchor, svg_1);
					};

					$.if(node_3, ($$render) => {
						if (hasDeleteButton()) $$render(consequent_2); else $$render(alternate_1, -1);
					});
				}

				$.reset(button_2);
				$.reset(div_6);

				$.template_effect(
					($0, $1, $2) => {
						$.set_attribute(a_2, 'href', $.get(item).to);
						$.set_attribute(a_2, 'data-item-key', $.get(item).key);
						$.set_attribute(video_1, 'aria-label', `${$.get(item).title} preview`);
						$.set_attribute(source, 'src', `${$.get(item).videoBase}.webm`);
						$.set_attribute(source_1, 'src', `${$.get(item).videoBase}.mp4`);
						$.set_text(text_4, $.get(item).title);
						$.set_text(text_5, $.get(item).categoryLabel);
						classes_2 = $.set_class(button_2, 1, 'favorite-button svelte-l89p71', null, classes_2, { visible: $0, saved: $1 });
						$.set_attribute(button_2, 'aria-label', $2);
					},
					[
						() => $.get(savedSet).has($.get(item).key) || $.get(hoveredKey) === $.get(item).key,
						() => $.get(savedSet).has($.get(item).key),
						() => hasDeleteButton()
							? 'Remove from favorites'
							: $.get(savedSet).has($.get(item).key) ? 'Remove from favorites' : 'Add to favorites'
					]
				);

				$.event('mouseenter', a_2, () => $.set(hoveredKey, $.get(item).key, true));

				$.event('mouseleave', a_2, () => {
					if ($.get(hoveredKey) === $.get(item).key) $.set(hoveredKey, null);
				});

				$.event('loadedmetadata', video_1, handleLoadedMetadata);

				$.delegated('click', button_2, () => {
					if (hasDeleteButton()) removeFavorite($.get(item).key); else toggleFavorite($.get(item).key);
				});

				$.append($$anchor, div_6);
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		$.if(node_1, ($$render) => {
			if ($.get(filtered).length === 0) $$render(consequent_1); else $$render(alternate_2, -1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $$props.title);
		classes = $.set_class(div_2, 1, 'component-list-controls svelte-l89p71', null, classes, { disabled: $$props.items.length === 0 });
		input.disabled = $$props.items.length === 0;
		select.disabled = $$props.items.length === 0;
		classes_1 = $.set_class(div_3, 1, 'clear-slot svelte-l89p71', null, classes_1, { show: $.get(showClear) });
		$.set_attribute(button, 'tabindex', $.get(showClear) ? 0 : -1);
	});

	$.bind_value(input, () => $.get(search), ($$value) => $.set(search, $$value));
	$.bind_select_value(select, () => $.get(selectedCategory), ($$value) => $.set(selectedCategory, $$value));
	$.delegated('click', button, clearFilters);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);