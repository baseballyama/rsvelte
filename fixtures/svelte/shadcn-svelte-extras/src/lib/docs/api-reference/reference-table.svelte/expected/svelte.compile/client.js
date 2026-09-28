import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Alert from '$lib/components/ui/alert';
import { Link } from '$lib/components/ui/link';
import { cn } from '$lib/utils.js';
import * as HoverCard from '$lib/components/ui/hover-card';
import InfoIcon from '@lucide/svelte/icons/info';
import { highlighter } from '$lib/components/ui/code/shiki';
import { onMount } from 'svelte';

var root = $.from_html(`Documentation for this component's props can be found at <!>`, 1);
var root_1 = $.from_html(`<span class="rounded-md bg-blue-500/50 px-2 py-1 font-mono text-xs font-light text-blue-600 dark:bg-blue-500/50 dark:text-blue-300">$bindable</span>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<tr class="bg-card border-border not-last:border-b"><td class="text-foreground px-4 py-2 align-top"><div class="flex place-items-center gap-2"><span class="bg-brand/25 text-brand rounded-md px-2 py-1 font-mono text-sm font-light"> </span> <!></div></td><td class="text-foreground flex place-items-center px-4 py-2 align-top whitespace-pre"><span class="bg-secondary text-foreground/75 rounded-md px-2 py-1 font-mono text-sm font-light"> </span> <!></td><td class="text-muted-foreground px-4 py-2 align-top"><span class="font-mono text-sm font-light"> </span></td></tr>`);
var root_4 = $.from_html(`<div class="border-border bg-card rounded-lg border"><table><thead><tr class="border-border border-b"><th class="text-foreground px-4 py-2 text-left text-sm font-semibold">Prop</th><th class="text-foreground px-4 py-2 text-left text-sm font-semibold">Type</th><th class="text-foreground px-4 py-2 text-left text-sm font-semibold">Default</th></tr></thead><tbody></tbody></table></div>`);
var root_5 = $.from_html(`<div class="flex flex-col gap-6"><div class="flex flex-col gap-3"><span class="bg-secondary flex w-fit place-items-center rounded-md px-2 py-1 font-mono text-lg font-light"><span> </span> <h3> </h3></span> <p class="text-neutral-800 dark:text-neutral-300"> </p></div> <!></div>`);

export default function Reference_table($$anchor, $$props) {
	$.push($$props, true);

	let hl = $.state(void 0);

	onMount(() => {
		highlighter.then((highlighter) => $.set(hl, highlighter, true));
	});

	var div = root_5();
	var div_1 = $.child(div);
	var span = $.child(div_1);
	var span_1 = $.child(span);
	var text = $.only_child(span_1);
	var h3 = $.sibling(span_1, 2);
	var text_1 = $.only_child(h3, true);

	$.reset(span);

	var p = $.sibling(span, 2);
	var text_2 = $.only_child(p, true);

	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Alert.Root, ($$anchor, Alert_Root) => {
				Alert_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Alert.Title, ($$anchor, Alert_Title) => {
							Alert_Title($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_2 = root();
									var node_3 = $.sibling($.first_child(fragment_2));

									Link(node_3, {
										get href() {
											return $$props.component.forwardTo.href;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text();

											$.template_effect(() => $.set_text(text_3, $$props.component.forwardTo.name));
											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		};

		var consequent_3 = ($$anchor) => {
			var div_2 = root_4();
			var table = $.child(div_2);
			var tbody = $.sibling($.child(table));

			$.each(tbody, 21, () => Object.entries($$props.component.props), ([prop, value]) => prop, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 2));
				let prop = () => $.get($$array)[0];
				let value = () => $.get($$array)[1];
				const propValue = $.derived(value);
				var tr = root_3();
				var td = $.child(tr);
				var div_3 = $.child(td);
				var span_2 = $.child(div_3);
				var text_4 = $.only_child(span_2);
				var node_4 = $.sibling(span_2, 2);

				{
					var consequent_1 = ($$anchor) => {
						var span_3 = root_1();

						$.append($$anchor, span_3);
					};

					$.if(node_4, ($$render) => {
						if ($.get(propValue).bindable) $$render(consequent_1);
					});
				}

				$.reset(div_3);
				$.reset(td);

				var td_1 = $.sibling(td);
				var span_4 = $.child(td_1);
				var text_5 = $.only_child(span_4, true);
				var node_5 = $.sibling(span_4, 2);

				{
					var consequent_2 = ($$anchor) => {
						const tooltipHighlighted = $.derived(() => $.get(hl)?.codeToHtml($.get(propValue).tooltip ?? '', {
							lang: $.get(propValue).type === 'Snippet' ? 'svelte' : 'typescript',
							themes: { light: 'github-light-default', dark: 'github-dark-default' }
						}));

						var fragment_4 = $.comment();
						var node_6 = $.first_child(fragment_4);

						$.component(node_6, () => HoverCard.Root, ($$anchor, HoverCard_Root) => {
							HoverCard_Root($$anchor, {
								openDelay: 50,
								closeDelay: 0,
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_2();
									var node_7 = $.first_child(fragment_5);

									$.component(node_7, () => HoverCard.Trigger, ($$anchor, HoverCard_Trigger) => {
										HoverCard_Trigger($$anchor, {
											class: 'text-muted-foreground inline-flex size-[26px] place-items-center justify-center',
											children: ($$anchor, $$slotProps) => {
												InfoIcon($$anchor, { class: 'size-4' });
											},
											$$slots: { default: true }
										});
									});

									var node_8 = $.sibling(node_7, 2);

									$.component(node_8, () => HoverCard.Content, ($$anchor, HoverCard_Content) => {
										HoverCard_Content($$anchor, {
											align: 'center',
											class: 'code-tooltip flex place-items-center justify-center p-0',
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = $.comment();
												var node_9 = $.first_child(fragment_7);

												$.html(node_9, () => $.get(tooltipHighlighted));
												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_4);
					};

					$.if(node_5, ($$render) => {
						if ($.get(propValue).tooltip) $$render(consequent_2);
					});
				}

				$.reset(td_1);

				var td_2 = $.sibling(td_1);
				var span_5 = $.child(td_2);
				var text_6 = $.only_child(span_5, true);

				$.reset(td_2);
				$.reset(tr);

				$.template_effect(() => {
					$.set_text(text_4, `${prop() ?? ''}${$.get(propValue).required ? '' : '?'}`);
					$.set_text(text_5, $.get(propValue).type);
					$.set_text(text_6, $.get(propValue).defaultValue === undefined ? '-' : $.get(propValue).defaultValue);
				});

				$.append($$anchor, tr);
			});

			$.reset(tbody);
			$.reset(table);
			$.reset(div_2);
			$.template_effect(($0) => $.set_class(table, 1, $0), [() => $.clsx(cn('w-full', ''))]);
			$.append($$anchor, div_2);
		};

		var d = $.derived(() => Object.entries($$props.component.props).length > 0);

		$.if(node, ($$render) => {
			if ($$props.component.forwardTo) $$render(consequent); else if ($.get(d)) $$render(consequent_3, 1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, `${$$props.name ?? ''}${$$props.component.name ? '.' : ''}`);
		$.set_attribute(h3, 'id', $$props.component.name);
		$.set_text(text_1, $$props.component.name);
		$.set_text(text_2, $$props.component.description);
	});

	$.append($$anchor, div);
	$.pop();
}