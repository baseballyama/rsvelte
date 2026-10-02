import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { CATEGORIES, slug } from '$lib/constants/categories';
import { fuzzyMatch } from '$lib/utils/fuzzy';

var root = $.from_svg(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"></path><path d="M9 20h6"></path><path d="M12 4v16"></path></svg>`);
var root_1 = $.from_svg(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"></path><path d="m2 17 10 5 10-5"></path><path d="m2 12 10 5 10-5"></path></svg>`);
var root_2 = $.from_svg(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"></path></svg>`);
var root_3 = $.from_svg(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="m12 8 4 4-4 4"></path></svg>`);
var root_4 = $.from_svg(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6"></path></svg>`);
var root_5 = $.from_html(`<div class="search-result-anim svelte-kk6vmu" role="option" tabindex="-1"><div><div class="search-result-icon svelte-kk6vmu"><!></div> <div class="search-result-text svelte-kk6vmu"><span class="search-result-name svelte-kk6vmu"> </span> <span class="search-result-category svelte-kk6vmu"> </span></div> <div class="search-result-enter svelte-kk6vmu"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 4v7a4 4 0 0 1-4 4H5"></path><path d="m9 11-4 4 4 4"></path></svg></div></div></div>`);
var root_6 = $.from_html(`<p class="search-no-results svelte-kk6vmu">No results found for <strong class="svelte-kk6vmu"> </strong></p>`);
var root_7 = $.from_html(`<div class="search-results-motion svelte-kk6vmu"><div class="search-results-wrapper svelte-kk6vmu"><div class="search-results svelte-kk6vmu" role="listbox" aria-label="Search results"><!></div> <div class="search-gradient search-gradient-top svelte-kk6vmu"></div> <div class="search-gradient search-gradient-bottom svelte-kk6vmu"></div></div></div>`);
var root_8 = $.from_html(`<div class="search-backdrop svelte-kk6vmu" role="presentation"><div class="search-dialog svelte-kk6vmu" role="dialog" aria-modal="true" aria-label="Search" tabindex="-1"><div class="search-input-row svelte-kk6vmu"><svg class="search-input-icon svelte-kk6vmu" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg> <input class="search-input svelte-kk6vmu" placeholder="Search components, categories, or keywords..." role="combobox" aria-autocomplete="list"/> <button type="button" class="search-kbd svelte-kk6vmu">esc</button></div> <!></div></div>`);

export default function SearchDialog($$anchor, $$props) {
	$.push($$props, true);

	let isOpen = $.prop($$props, 'isOpen', 3, false);
	let inputValue = $.state('');
	let searchValue = $.state('');
	let topGradientOpacity = $.state(0);
	let bottomGradientOpacity = $.state(1);
	let selectedIndex = $.state(-1);
	let keyboardNav = $.state(false);
	let resultsRef = $.state(null);
	let inputRef = $.state(null);
	let dialogRef = $.state(null);
	let previouslyFocused = $.state(null);
	const listboxId = 'component-search-results';

	function searchComponents(query) {
		if (!query || query.trim() === '') return [];

		const results = [];

		CATEGORIES.forEach(({ name: categoryName, subcategories }) => {
			if (fuzzyMatch(categoryName, query)) {
				subcategories.forEach((componentName) => results.push({ categoryName, componentName }));
			} else {
				subcategories.forEach((componentName) => {
					if (fuzzyMatch(componentName, query)) results.push({ categoryName, componentName });
				});
			}
		});

		return results;
	}

	const results = $.derived(() => searchComponents($.get(searchValue)));

	$.user_effect(() => {
		if (!$.get(resultsRef)) return;

		void $.get(results).length;

		const { scrollTop, scrollHeight, clientHeight } = $.get(resultsRef);

		$.set(
			bottomGradientOpacity,
			scrollHeight <= clientHeight
				? 0
				: Math.min((scrollHeight - (scrollTop + clientHeight)) / 50, 1),
			true
		);
	});

	$.user_effect(() => {
		if (!isOpen()) {
			$.set(inputValue, '');
			$.set(searchValue, '');
			$.set(selectedIndex, -1);
			$.set(topGradientOpacity, 0);
			$.set(bottomGradientOpacity, 1);
			$.get(previouslyFocused)?.focus?.();
			$.set(previouslyFocused, null);

			return;
		}

		$.set(previouslyFocused, document.activeElement instanceof HTMLElement ? document.activeElement : null, true);

		const t = setTimeout(() => $.get(inputRef)?.focus(), 50);

		return () => clearTimeout(t);
	});

	$.user_effect(() => {
		const onKey = (e) => {
			const target = e.target;
			const isEditable = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;

			if (e.key === '/' && !isOpen() && !isEditable) {
				e.preventDefault();
				$$props.onToggle?.();
			} else if (e.key === 'Escape' && isOpen()) {
				$$props.onClose?.();
			}
		};

		window.addEventListener('keydown', onKey);

		return () => window.removeEventListener('keydown', onKey);
	});

	$.user_effect(() => {
		const onKey = (e) => {
			if (!isOpen()) return;

			if (e.key === 'Tab') {
				if (!$.get(dialogRef)) return;

				const focusable = getFocusable($.get(dialogRef));

				if (focusable.length === 0) return;

				const first = focusable[0];
				const last = focusable[focusable.length - 1];

				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}

				return;
			}

			if (!$.get(searchValue)) return;

			if (e.key === 'ArrowDown' || e.key === 'Tab' && !e.shiftKey) {
				e.preventDefault();
				$.set(keyboardNav, true);
				$.set(selectedIndex, Math.min($.get(selectedIndex) + 1, $.get(results).length - 1), true);
			} else if (e.key === 'ArrowUp' || e.key === 'Tab' && e.shiftKey) {
				e.preventDefault();
				$.set(keyboardNav, true);
				$.set(selectedIndex, Math.max($.get(selectedIndex) - 1, 0), true);
			} else if (e.key === 'Enter' && $.get(selectedIndex) >= 0) {
				e.preventDefault();
				selectResult($.get(results)[$.get(selectedIndex)]);
			}
		};

		window.addEventListener('keydown', onKey);

		return () => window.removeEventListener('keydown', onKey);
	});

	$.user_effect(() => {
		if (!$.get(keyboardNav) || $.get(selectedIndex) < 0 || !$.get(resultsRef)) return;

		const item = $.get(resultsRef).querySelector(`[data-index="${$.get(selectedIndex)}"]`);

		if (!item) return;

		const margin = 50;
		const itemTop = item.offsetTop;
		const itemBottom = itemTop + item.offsetHeight;

		if (itemTop < $.get(resultsRef).scrollTop + margin) {
			$.get(resultsRef).scrollTo({ top: itemTop - margin, behavior: 'smooth' });
		} else if (itemBottom > $.get(resultsRef).scrollTop + $.get(resultsRef).clientHeight - margin) {
			$.get(resultsRef).scrollTo({
				top: itemBottom - $.get(resultsRef).clientHeight + margin,
				behavior: 'smooth'
			});
		}

		$.set(keyboardNav, false);
	});

	function handleScroll(e) {
		const target = e.currentTarget;
		const { scrollTop, scrollHeight, clientHeight } = target;

		$.set(topGradientOpacity, Math.min(scrollTop / 50, 1), true);

		const bottomDist = scrollHeight - (scrollTop + clientHeight);

		$.set(bottomGradientOpacity, scrollHeight <= clientHeight ? 0 : Math.min(bottomDist / 50, 1), true);
	}

	function close() {
		$$props.onClose?.();
	}

	function closeFromBackdrop(e) {
		if (e.target === e.currentTarget) close();
	}

	function handleInput(e) {
		$.set(inputValue, e.currentTarget.value, true);
		$.set(searchValue, $.get(inputValue), true);
		$.set(selectedIndex, -1);
	}

	function handleInputKeydown(e) {
		if (e.key === 'ArrowDown' && $.get(results).length > 0) {
			e.preventDefault();
			$.set(keyboardNav, true);
			$.set(selectedIndex, Math.max($.get(selectedIndex), 0), true);
		}
	}

	function handleResultKeydown(e, result) {
		if (e.key !== 'Enter' && e.key !== ' ') return;

		e.preventDefault();
		selectResult(result);
	}

	function selectResult(result) {
		if (!result) return;

		goto(`/${slug(result.categoryName)}/${slug(result.componentName)}`);
		$.set(inputValue, '');
		$.set(searchValue, '');
		$.set(selectedIndex, -1);
		close();
	}

	function getFocusable(container) {
		return Array.from(container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_6 = ($$anchor) => {
			var div = root_8();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var input = $.sibling($.child(div_2), 2);

			$.remove_input_defaults(input);
			$.set_attribute(input, 'aria-controls', listboxId);
			$.bind_this(input, ($$value) => $.set(inputRef, $$value), () => $.get(inputRef));

			var button = $.sibling(input, 2);

			$.reset(div_2);

			var node_1 = $.sibling(div_2, 2);

			{
				var consequent_5 = ($$anchor) => {
					var div_3 = root_7();
					var div_4 = $.child(div_3);
					var div_5 = $.child(div_4);

					$.set_attribute(div_5, 'id', listboxId);

					var node_2 = $.child(div_5);

					{
						var consequent_4 = ($$anchor) => {
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							$.each(node_3, 19, () => $.get(results), (r, i) => `${r.categoryName}-${r.componentName}-${i}`, ($$anchor, r, i) => {
								var div_6 = root_5();
								var div_7 = $.child(div_6);
								var div_8 = $.child(div_7);
								var node_4 = $.child(div_8);

								{
									var consequent = ($$anchor) => {
										var svg = root();

										$.append($$anchor, svg);
									};

									var consequent_1 = ($$anchor) => {
										var svg_1 = root_1();

										$.append($$anchor, svg_1);
									};

									var consequent_2 = ($$anchor) => {
										var svg_2 = root_2();

										$.append($$anchor, svg_2);
									};

									var consequent_3 = ($$anchor) => {
										var svg_3 = root_3();

										$.append($$anchor, svg_3);
									};

									var alternate = ($$anchor) => {
										var svg_4 = root_4();

										$.append($$anchor, svg_4);
									};

									$.if(node_4, ($$render) => {
										if ($.get(r).categoryName === 'Text Animations') $$render(consequent); else if ($.get(r).categoryName === 'Components') $$render(consequent_1, 1); else if ($.get(r).categoryName === 'Backgrounds') $$render(consequent_2, 2); else if ($.get(r).categoryName === 'Animations') $$render(consequent_3, 3); else $$render(alternate, -1);
									});
								}

								$.reset(div_8);

								var div_9 = $.sibling(div_8, 2);
								var span = $.child(div_9);
								var text = $.only_child(span, true);
								var span_1 = $.sibling(span, 2);
								var text_1 = $.only_child(span_1);

								$.reset(div_9);
								$.next(2);
								$.reset(div_7);
								$.reset(div_6);

								$.template_effect(() => {
									$.set_attribute(div_6, 'id', `search-result-${$.get(i) ?? ''}`);
									$.set_attribute(div_6, 'data-index', $.get(i));
									$.set_attribute(div_6, 'aria-selected', $.get(selectedIndex) === $.get(i));
									$.set_class(div_7, 1, `search-result-item${$.get(selectedIndex) === $.get(i) ? ' selected' : ''}`, 'svelte-kk6vmu');
									$.set_text(text, $.get(r).componentName);
									$.set_text(text_1, `in ${$.get(r).categoryName ?? ''}`);
								});

								$.event('mouseenter', div_6, () => $.set(selectedIndex, $.get(i), true));
								$.delegated('click', div_6, () => selectResult($.get(r)));
								$.delegated('keydown', div_6, (e) => handleResultKeydown(e, $.get(r)));
								$.append($$anchor, div_6);
							});

							$.append($$anchor, fragment_1);
						};

						var alternate_1 = ($$anchor) => {
							var p = root_6();
							var strong = $.sibling($.child(p));
							var text_2 = $.only_child(strong, true);

							$.reset(p);
							$.template_effect(() => $.set_text(text_2, $.get(searchValue)));
							$.append($$anchor, p);
						};

						$.if(node_2, ($$render) => {
							if ($.get(results).length > 0) $$render(consequent_4); else $$render(alternate_1, -1);
						});
					}

					$.reset(div_5);
					$.bind_this(div_5, ($$value) => $.set(resultsRef, $$value), () => $.get(resultsRef));

					var div_10 = $.sibling(div_5, 2);
					let styles;
					var div_11 = $.sibling(div_10, 2);
					let styles_1;

					$.reset(div_4);
					$.reset(div_3);

					$.template_effect(() => {
						styles = $.set_style(div_10, '', styles, { opacity: $.get(topGradientOpacity) });
						styles_1 = $.set_style(div_11, '', styles_1, { opacity: $.get(bottomGradientOpacity) });
					});

					$.event('scroll', div_5, handleScroll);
					$.append($$anchor, div_3);
				};

				$.if(node_1, ($$render) => {
					if ($.get(searchValue)) $$render(consequent_5);
				});
			}

			$.reset(div_1);
			$.bind_this(div_1, ($$value) => $.set(dialogRef, $$value), () => $.get(dialogRef));
			$.reset(div);

			$.template_effect(
				($0) => {
					$.set_value(input, $.get(inputValue));
					$.set_attribute(input, 'aria-expanded', $0);
					$.set_attribute(input, 'aria-activedescendant', $.get(selectedIndex) >= 0 ? `search-result-${$.get(selectedIndex)}` : undefined);
				},
				[() => Boolean($.get(searchValue))]
			);

			$.delegated('click', div, closeFromBackdrop);
			$.delegated('input', input, handleInput);
			$.delegated('keydown', input, handleInputKeydown);
			$.delegated('click', button, close);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (isOpen()) $$render(consequent_6);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'input', 'keydown']);