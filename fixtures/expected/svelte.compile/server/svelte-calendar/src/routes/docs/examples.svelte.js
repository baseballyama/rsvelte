import * as $ from 'svelte/internal/server';
import Crossfade from '$lib/components/generic/crossfade/Crossfade.svelte';
import Theme from '$lib/components/generic/Theme.svelte';
import { dark } from '$lib/config/theme';
import blurr from '$lib/directives/blurr';
import Code from '$lib/docs/Code.svelte';
import CodeExample from '$lib/docs/CodeExample.svelte';
import DocPage from '$lib/docs/DocPage.svelte';

export default function Examples($$renderer) {
	// @example(quickStart, QuickStart.svelte)
	// @example(startAndEnd, StartAndEnd.svelte)
	// @example(inlineCalendar, InlineCalendar.svelte)
	// @example(darkTheme, DarkTheme.svelte)
	// @example(customTheme, CustomTheme.svelte)
	// @example(formatting, Formatting.svelte)
	// @example(storeExample, Store.svelte)
	// @example(localeExample, Locale.svelte)
	// @example(customTrigger, CustomTrigger.svelte)
	let example = null;

	const examples = [
		{
			title: 'Quick Start',
			component: quickStart.component,
			code: quickStart.code
		},

		{
			title: 'Start & End',
			component: startAndEnd.component,
			code: startAndEnd.code
		},

		{
			title: 'Inline Calendar',
			component: inlineCalendar.component,
			code: inlineCalendar.code
		},

		{
			title: 'Dark Theme',
			component: darkTheme.component,
			code: darkTheme.code
		},

		{
			title: 'Custom Theme',
			component: customTheme.component,
			code: customTheme.code
		},

		{
			title: 'Formatting',
			component: formatting.component,
			code: formatting.code
		},

		{
			title: 'Accessing Store',
			component: storeExample.component,
			code: storeExample.code
		},

		{
			title: 'Locale',
			component: localeExample.component,
			code: localeExample.code
		},

		{
			title: 'Custom Trigger',
			component: customTrigger.component,
			code: customTrigger.code
		}
	];

	// todo: work out fix for switching between examples
	const openExample = (ex) => () => {
		example = ex;
	};

	const closeExample = () => {
		example = null;
	};

	Crossfade($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { key, send, receive }) => {
				DocPage($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="grid svelte-1a5y3dx"><!--[-->`);

						const each_array = $.ensure_array_like(examples);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let ex = each_array[$$index];

							$$renderer.push(`<div class="svelte-1a5y3dx">`);

							if (example !== ex) {
								$$renderer.push(`<!--[0--><a href="#example" class="svelte-1a5y3dx">${$.escape(ex.title)}</a>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						}

						$$renderer.push(`<!--]--></div>`);
					},

					$$slots: {
						default: true,
						title: ($$renderer) => {
							{
								$$renderer.push(`Examples`);
							}
						}
					}
				});

				$$renderer.push(`<!----> `);

				if (example) {
					$$renderer.push('<!--[0-->');

					Theme($$renderer, {
						theme: dark,
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$renderer, { style }) => {
								$$renderer.push(`<div class="modal svelte-1a5y3dx"${$.attr_style(style)}>`);

								CodeExample($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<div class="result-column svelte-1a5y3dx"><h1 class="svelte-1a5y3dx">${$.escape(example.title)} <button class="svelte-1a5y3dx">X</button></h1> <div class="example svelte-1a5y3dx">`);

										if (example.component) {
											$$renderer.push('<!--[-->');
											example.component($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(`</div></div>`);
									},

									$$slots: {
										default: true,
										code: ($$renderer) => {
											$$renderer.push(`<div class="code svelte-1a5y3dx" slot="code">`);
											Code($$renderer, { pretranslated: example.code });
											$$renderer.push(`<!----></div>`);
										}
									}
								});

								$$renderer.push(`<!----></div>`);
							}
						}
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}
		}
	});
}