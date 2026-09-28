import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { onDestroy, untrack } from 'svelte';
import { goto } from '$app/navigation';
import { trackEvent } from '$lib/actions/analytics';
import { Icon, Input } from '@appwrite.io/pink-svelte';
import { IconSearch, IconX } from '@appwrite.io/pink-icons-svelte';
import { debounce as createDebounce } from '$lib/helpers/debounce.js';

export default function SearchQuery($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			placeholder = '',
			debounce = 250,
			required = false,
			disabled = false,
			autofocus = false
		} = $$props;

		const initialSearch = page.url.searchParams.get('search') ?? '';
		let inputValue = initialSearch;
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
			debounce
		);

		function clearInput() {
			inputValue = '';
		}

		onDestroy(() => {
			runSearch.cancel?.();
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_style('', { 'max-width': '360px', width: '100%' })}>`);

			$.css_props(
				$$renderer,
				true,
				{
					'--bgcolor-neutral-default': 'var(--bgcolor-neutral-primary)'
				},
				() => {
					if (Input.Text) {
						$$renderer.push('<!--[-->');

						Input.Text($$renderer, {
							placeholder,
							disabled,
							required,
							autofocus,
							get value() {
								return inputValue;
							},

							set value($$value) {
								inputValue = $$value;
								$$settled = false;
							},

							$$slots: {
								start: ($$renderer) => {
									{
										Icon($$renderer, { icon: IconSearch });
									}
								},

								end: ($$renderer) => {
									{
										if (inputValue) {
											$$renderer.push('<!--[0-->');

											if (Input.Action) {
												$$renderer.push('<!--[-->');
												Input.Action($$renderer, { icon: IconX });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
									}
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				true
			);

			$$renderer.push(`</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { clearInput });
	});
}