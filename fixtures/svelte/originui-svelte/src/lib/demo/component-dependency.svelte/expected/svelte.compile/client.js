import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip/index.js';
import { cn } from '$lib/utils.js';
import ExternalLink from '@lucide/svelte/icons/external-link';
import Package from '@lucide/svelte/icons/package';

var root = $.from_html(`<div class="flex items-center justify-between gap-4"><span class="font-mono text-sm"> </span> <span class="bg-muted text-muted-foreground justify-self-end rounded-full px-2 py-1 text-xs"> </span></div> <div class="text-muted-foreground flex items-center justify-between gap-4 text-xs"><div class="flex items-center"><!> <span class="truncate"> </span></div> <!></div>`, 1);
var root_1 = $.from_html(`<p> </p> <p> </p> <p> </p>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Component_dependency($$anchor, $$props) {
	$.push($$props, true);

	TooltipProvider($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_2();
					var node = $.first_child(fragment_2);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;

							{
								let $0 = $.derived(() => cn('border-border grid h-fit items-start justify-stretch gap-2 border', $$props.class));

								Button($$anchor, $.spread_props(props, {
									variant: 'ghost',
									get class() {
										return $.get($0);
									},

									get href() {
										return $$props.dependency.url;
									},
									target: '_blank',
									rel: 'noopener noreferrer',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var div = $.first_child(fragment_4);
										var span = $.child(div);
										var text = $.only_child(span, true);
										var span_1 = $.sibling(span, 2);
										var text_1 = $.only_child(span_1, true);

										$.reset(div);

										var div_1 = $.sibling(div, 2);
										var div_2 = $.child(div_1);
										var node_1 = $.child(div_2);

										Package(node_1, { class: 'mr-1 h-3 w-3' });

										var span_2 = $.sibling(node_1, 2);
										var text_2 = $.only_child(span_2, true);

										$.reset(div_2);

										var node_2 = $.sibling(div_2, 2);

										ExternalLink(node_2, { class: 'h-3 w-3' });
										$.reset(div_1);

										$.template_effect(() => {
											$.set_attribute(span, 'title', $$props.dependency.packageName);
											$.set_text(text, $$props.dependency.packageName);
											$.set_text(text_1, $$props.dependency.dev ? 'Dev' : 'Prod');
											$.set_attribute(span_2, 'title', $$props.dependency.name);
											$.set_text(text_2, $$props.dependency.name);
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								}));
							}
						};

						TooltipTrigger(node, { child, $$slots: { child: true } });
					}

					var node_3 = $.sibling(node, 2);

					TooltipContent(node_3, {
						class: 'border-input bg-popover text-muted-foreground border px-2 py-1 text-xs',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_1();
							var p = $.first_child(fragment_5);
							var text_3 = $.only_child(p);
							var p_1 = $.sibling(p, 2);
							var text_4 = $.only_child(p_1);
							var p_2 = $.sibling(p_1, 2);
							var text_5 = $.only_child(p_2);

							$.template_effect(() => {
								$.set_text(text_3, `Package: ${$$props.dependency.packageName ?? ''}`);
								$.set_text(text_4, `Name: ${$$props.dependency.name ?? ''}`);
								$.set_text(text_5, `Type: ${$$props.dependency.dev ? 'Dev Dependency' : 'Prod Dependency'}`);
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}