import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Crossfade from '$lib/components/generic/crossfade/Crossfade.svelte';
import Theme from '$lib/components/generic/Theme.svelte';
import { dark } from '$lib/config/theme';
import blurr from '$lib/directives/blurr';
import Code from '$lib/docs/Code.svelte';
import CodeExample from '$lib/docs/CodeExample.svelte';
import DocPage from '$lib/docs/DocPage.svelte';

var root = $.from_html(`<a href="#example" class="svelte-1a5y3dx"> </a>`);
var root_1 = $.from_html(`<div class="svelte-1a5y3dx"><!></div>`);
var root_2 = $.from_html(`<div class="grid svelte-1a5y3dx"></div>`);
var root_3 = $.from_html(`<div class="result-column svelte-1a5y3dx"><h1 class="svelte-1a5y3dx"> <button class="svelte-1a5y3dx">X</button></h1> <div class="example svelte-1a5y3dx"><!></div></div>`);
var root_4 = $.from_html(`<div class="code svelte-1a5y3dx" slot="code"><!></div>`);
var root_5 = $.from_html(`<div class="modal svelte-1a5y3dx"><!></div>`);
var root_6 = $.from_html(`<!> <!>`, 1);

export default function Examples($$anchor) {
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

	Crossfade($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const key = $.derived(() => $$slotProps.key);
				const send = $.derived(() => $$slotProps.send);
				const receive = $.derived(() => $$slotProps.receive);
				var fragment_1 = root_6();
				var node = $.first_child(fragment_1);

				DocPage(node, {
					children: ($$anchor, $$slotProps) => {
						var div = root_2();

						$.each(div, 21, () => examples, $.index, ($$anchor, ex) => {
							var div_1 = root_1();
							var node_1 = $.child(div_1);

							{
								var consequent = ($$anchor) => {
									var a = root();
									var event_handler = $.derived(() => openExample($.get(ex)));
									var text = $.only_child(a, true);

									$.template_effect(() => $.set_text(text, $.get(ex).title));
									$.transition(1, a, () => $.get(receive), () => ({ key: $.get(key) }));
									$.transition(2, a, () => $.get(send), () => ({ key: $.get(key) }));

									$.event('click', a, $.preventDefault(function (...$$args) {
										$.get(event_handler)?.apply(this, $$args);
									}));

									$.append($$anchor, a);
								};

								$.if(node_1, ($$render) => {
									if (example !== $.get(ex)) $$render(consequent);
								});
							}

							$.reset(div_1);
							$.append($$anchor, div_1);
						});

						$.reset(div);
						$.append($$anchor, div);
					},

					$$slots: {
						default: true,
						title: ($$anchor, $$slotProps) => {
							var text_1 = $.text('Examples');

							$.append($$anchor, text_1);
						}
					}
				});

				var node_2 = $.sibling(node, 2);

				{
					var consequent_1 = ($$anchor) => {
						Theme($$anchor, {
							get theme() {
								return dark;
							},
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$anchor, $$slotProps) => {
									const style = $.derived(() => $$slotProps.style);
									var div_2 = root_5();
									var node_3 = $.child(div_2);

									CodeExample(node_3, {
										children: ($$anchor, $$slotProps) => {
											var div_3 = root_3();
											var h1 = $.child(div_3);
											var text_2 = $.child(h1);
											var button = $.sibling(text_2);

											$.reset(h1);

											var div_4 = $.sibling(h1, 2);
											var node_4 = $.child(div_4);

											$.component(node_4, () => example.component, ($$anchor, $$component) => {
												$$component($$anchor, {});
											});

											$.reset(div_4);
											$.reset(div_3);
											$.template_effect(() => $.set_text(text_2, `${example.title ?? ''} `));
											$.event('click', button, closeExample);
											$.append($$anchor, div_3);
										},

										$$slots: {
											default: true,
											code: ($$anchor, $$slotProps) => {
												var div_5 = root_4();
												var node_5 = $.child(div_5);

												Code(node_5, {
													get pretranslated() {
														return example.code;
													}
												});

												$.reset(div_5);
												$.append($$anchor, div_5);
											}
										}
									});

									$.reset(div_2);
									$.action(div_2, ($$node) => blurr?.($$node));
									$.effect(() => $.event('blurr', div_2, closeExample));
									$.template_effect(() => $.set_style(div_2, $.get(style)));
									$.transition(1, div_2, () => $.get(receive), () => ({ key: $.get(key) }));
									$.transition(2, div_2, () => $.get(send), () => ({ key: $.get(key) }));
									$.append($$anchor, div_2);
								}
							}
						});
					};

					$.if(node_2, ($$render) => {
						if (example) $$render(consequent_1);
					});
				}

				$.append($$anchor, fragment_1);
			}
		}
	});
}