import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tabs from '$lib/components/ui/tabs';
import * as Code from '$lib/components/ui/code';
import { cn } from '$lib/utils.js';
import { Button } from './ui/button';
import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex size-full place-items-center justify-center"><!></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div><!></div>`);

export default function Playground($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, undefined),
		replay = $.prop($$props, 'replay', 3, false);

	let remountCount = $.state(0);
	let tab = $.state('preview');
	var div = root_3();
	var node = $.child(div);

	$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, {
			class: 'size-full',
			get value() {
				return $.get(tab);
			},

			set value($$value) {
				$.set(tab, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
					Tabs_List($$anchor, {
						class: 'absolute top-3 right-3 z-10',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
								Tabs_Trigger($$anchor, {
									value: 'preview',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Preview');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
								Tabs_Trigger_1($$anchor, {
									value: 'code',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Code');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Tabs.Content, ($$anchor, Tabs_Content) => {
					Tabs_Content($$anchor, {
						value: 'preview',
						class: 'size-full',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_5 = $.first_child(fragment_2);

							{
								var consequent = ($$anchor) => {
									Button($$anchor, {
										size: 'icon',
										variant: 'ghost',
										class: 'absolute top-3 left-3',
										onclick: () => $.update(remountCount),
										children: ($$anchor, $$slotProps) => {
											RefreshCwIcon($$anchor, { class: 'size-4' });
										},
										$$slots: { default: true }
									});
								};

								$.if(node_5, ($$render) => {
									if (replay()) $$render(consequent);
								});
							}

							var node_6 = $.sibling(node_5, 2);

							$.key(node_6, () => $.get(remountCount), ($$anchor) => {
								var div_1 = root_1();
								var node_7 = $.child(div_1);

								$.snippet(node_7, () => $$props.children);
								$.reset(div_1);
								$.append($$anchor, div_1);
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_4, 2);

				$.component(node_8, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
					Tabs_Content_1($$anchor, {
						value: 'code',
						class: 'size-full pb-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_9 = $.first_child(fragment_5);

							$.component(node_9, () => Code.Root, ($$anchor, Code_Root) => {
								Code_Root($$anchor, {
									lang: 'svelte',
									get code() {
										return $$props.code;
									},
									class: 'size-full border-none bg-transparent',
									hideLines: true
								});
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(cn('border-border relative flex min-h-[400px] place-items-center justify-center rounded-lg border', className()))
	]);

	$.append($$anchor, div);
	$.pop();
}