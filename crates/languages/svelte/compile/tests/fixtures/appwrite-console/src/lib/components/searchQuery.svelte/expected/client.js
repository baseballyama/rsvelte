import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { onDestroy, untrack } from 'svelte';
import { goto } from '$app/navigation';
import { trackEvent } from '$lib/actions/analytics';
import { Icon, Input } from '@appwrite.io/pink-svelte';
import { IconSearch, IconX } from '@appwrite.io/pink-icons-svelte';
import { debounce as createDebounce } from '$lib/helpers/debounce.js';

var root = $.from_html(`<div><svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper></div>`);

export default function SearchQuery($$anchor, $$props) {
	$.push($$props, true);

	let placeholder = $.prop($$props, 'placeholder', 3, ''),
		debounce = $.prop($$props, 'debounce', 3, 250),
		required = $.prop($$props, 'required', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		autofocus = $.prop($$props, 'autofocus', 3, false);

	const initialSearch = page.url.searchParams.get('search') ?? '';
	let inputValue = $.state($.proxy(initialSearch));
	let previousInputValue = initialSearch;
	let previousUrlSearch = initialSearch;

	const runSearch = createDebounce(
		(value) => {
			const trimmed = value.trim();
			const url = new URL(page.url);
			const previous = url.searchParams.get('search') ?? '';

			if (previous === trimmed) return;

			if (page.data.page > 1) {
				url.searchParams.delete('page');
			}

			if (trimmed === '') {
				url.searchParams.delete('search');
			} else {
				url.searchParams.set('search', trimmed);
			}

			trackEvent('search');
			goto(url, { keepFocus: true });
		},
		debounce()
	);

	function clearInput() {
		$.set(inputValue, '');
	}

	onDestroy(() => {
		runSearch.cancel?.();
	});

	$.user_effect(() => {
		const urlSearch = page.url.searchParams.get('search') ?? '';

		if (urlSearch !== previousUrlSearch) {
			previousUrlSearch = urlSearch;

			const currentInput = untrack(() => $.get(inputValue));

			if (urlSearch !== currentInput) {
				$.set(inputValue, urlSearch, true);
				previousInputValue = urlSearch;
			}
		}
	});

	$.user_effect(() => {
		if ($.get(inputValue) !== previousInputValue) {
			const urlSearch = untrack(() => page.url.searchParams.get('search') ?? '');

			if ($.get(inputValue) !== urlSearch) {
				previousInputValue = $.get(inputValue);
				runSearch($.get(inputValue));
			} else {
				previousInputValue = $.get(inputValue);
			}
		}
	});

	var $$exports = { clearInput };
	var div = root();

	$.set_style(div, '', {}, { 'max-width': '360px', width: '100%' });

	var node = $.child(div);

	{
		$.css_props(node, () => ({
			'--bgcolor-neutral-default': 'var(--bgcolor-neutral-primary)'
		}));

		$.component(node.lastChild, () => Input.Text, ($$anchor, Input_Text) => {
			Input_Text($$anchor, {
				get placeholder() {
					return placeholder();
				},

				get disabled() {
					return disabled();
				},

				get required() {
					return required();
				},

				get autofocus() {
					return autofocus();
				},

				get value() {
					return $.get(inputValue);
				},

				set value($$value) {
					$.set(inputValue, $$value, true);
				},

				$$slots: {
					start: ($$anchor, $$slotProps) => {
						Icon($$anchor, {
							get icon() {
								return IconSearch;
							}
						});
					},

					end: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_1 = $.first_child(fragment_1);

						{
							var consequent = ($$anchor) => {
								var fragment_2 = $.comment();
								var node_2 = $.first_child(fragment_2);

								$.component(node_2, () => Input.Action, ($$anchor, Input_Action) => {
									Input_Action($$anchor, {
										get icon() {
											return IconX;
										},
										$$events: { click: clearInput }
									});
								});

								$.append($$anchor, fragment_2);
							};

							$.if(node_1, ($$render) => {
								if ($.get(inputValue)) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_1);
					}
				}
			});
		});

		$.reset(node);
	}

	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}