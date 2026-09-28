import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodePreview from '../code-preview.svelte';
import ComponentDependency from '../component-dependency.svelte';
import GotoComponentButton from '../component-goto-button.svelte';
import CopyButton from '../copy-button.svelte';
import ShareButton from '../share-button.svelte';
import Box from '@lucide/svelte/icons/box';
import Code from '@lucide/svelte/icons/code';
import Folder from '@lucide/svelte/icons/folder';
import FolderTree from '@lucide/svelte/icons/folder-tree';
import { page } from '$app/state';
import * as Tab from '$lib/components/ui/tabs';
import { tick } from 'svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'component',
	'isSinglePage',
	'onGotoComponent'
]);

var root = $.from_html(`<div class="bg-background flex scale-90 flex-col items-center gap-4 rounded-lg border p-6"><!></div>`);
var root_1 = $.from_html(`<!> Code`, 1);
var root_2 = $.from_html(`<!> Dependencies`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="grid grid-cols-2 gap-4 pt-4"></div>`);
var root_5 = $.from_html(`<!> <div class="overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.4,_0,_0.2,_1)]"><div><!> <!></div></div>`, 1);
var root_6 = $.from_html(`<div><div class="space-y-2"><div class="flex items-center gap-2"><h2 class="text-2xl font-bold"> </h2> <!> <!></div> <div class="flex flex-col gap-1"><div class="text-muted-foreground text-sm"><!> <span>Directory:</span> <span> </span></div> <div class="text-muted-foreground text-sm"><!> <span>Path:</span> <span> </span></div></div></div> <!> <div class=" flex flex-col gap-4"><!></div></div>`);

export default function Content($$anchor, $$props) {
	$.push($$props, true);

	let isSinglePage = $.prop($$props, 'isSinglePage', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let dialogRef = $.state(null);
	let wrapperRef = $.state(null);

	const handleTabChange = () => {
		tick().then(() => {});
	};

	var div = root_6();

	$.attribute_effect(div, () => ({ class: 'flex flex-col gap-4 px-4 pb-4', ...restProps }));

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var h2 = $.child(div_2);
	var text = $.only_child(h2, true);
	var node = $.sibling(h2, 2);

	ShareButton(node, {
		get component() {
			return $$props.component;
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			GotoComponentButton($$anchor, {
				get description() {
					return `Go to the ${$$props.component.name ?? ''} component`;
				},

				get href() {
					return `${page.url.href ?? ''}/${$$props.component.id ?? ''}`;
				},

				get onclick() {
					return $$props.onGotoComponent;
				}
			});
		};

		$.if(node_1, ($$render) => {
			if (!isSinglePage()) $$render(consequent);
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.child(div_3);
	var node_2 = $.child(div_4);

	Folder(node_2, { class: 'inline-block', size: 16, 'aria-hidden': 'true' });

	var span = $.sibling(node_2, 4);
	var text_1 = $.only_child(span, true);

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_3 = $.child(div_5);

	FolderTree(node_3, { class: 'inline-block', size: 16, 'aria-hidden': 'true' });

	var span_1 = $.sibling(node_3, 4);
	var text_2 = $.only_child(span_1, true);

	$.reset(div_5);
	$.reset(div_3);
	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_6 = root();
			var node_5 = $.child(div_6);

			$.component(node_5, () => $$props.component.Component, ($$anchor, component_Component) => {
				component_Component($$anchor, {});
			});

			$.reset(div_6);
			$.append($$anchor, div_6);
		};

		$.if(node_4, ($$render) => {
			if (isSinglePage()) $$render(consequent_1);
		});
	}

	var div_7 = $.sibling(node_4, 2);
	var node_6 = $.child(div_7);

	$.component(node_6, () => Tab.Tabs, ($$anchor, Tab_Tabs) => {
		Tab_Tabs($$anchor, {
			value: 'code',
			onValueChange: handleTabChange,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_5();
				var node_7 = $.first_child(fragment_1);

				$.component(node_7, () => Tab.TabsList, ($$anchor, Tab_TabsList) => {
					Tab_TabsList($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_3();
							var node_8 = $.first_child(fragment_2);

							$.component(node_8, () => Tab.TabsTrigger, ($$anchor, Tab_TabsTrigger) => {
								Tab_TabsTrigger($$anchor, {
									value: 'code',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_9 = $.first_child(fragment_3);

										Code(node_9, {
											class: '-ms-0.5 me-1.5 opacity-60',
											size: 16,
											'aria-hidden': 'true'
										});

										$.next();
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_8, 2);

							{
								var consequent_2 = ($$anchor) => {
									var fragment_4 = $.comment();
									var node_11 = $.first_child(fragment_4);

									$.component(node_11, () => Tab.TabsTrigger, ($$anchor, Tab_TabsTrigger_1) => {
										Tab_TabsTrigger_1($$anchor, {
											value: 'dependencies',
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_2();
												var node_12 = $.first_child(fragment_5);

												Box(node_12, {
													class: '-ms-0.5 me-1.5 opacity-60',
													size: 16,
													'aria-hidden': 'true'
												});

												$.next();
												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								};

								$.if(node_10, ($$render) => {
									if ($$props.component.componentDependencies.list.length > 0) $$render(consequent_2);
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var div_8 = $.sibling(node_7, 2);
				var div_9 = $.child(div_8);
				var node_13 = $.child(div_9);

				$.component(node_13, () => Tab.TabsContent, ($$anchor, Tab_TabsContent) => {
					Tab_TabsContent($$anchor, {
						value: 'code',
						class: 'relative pt-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_3();
							var node_14 = $.first_child(fragment_6);

							CopyButton(node_14, {
								class: 'absolute top-4 right-2',
								get code() {
									return $$props.component.code.raw.content;
								}
							});

							var node_15 = $.sibling(node_14, 2);

							{
								let $0 = $.derived(() => isSinglePage() ? true : false);

								CodePreview(node_15, {
									class: 'bg-muted overflow-y-auto rounded-lg py-4 [&_pre]:data-[component=false]:max-h-[440px] [&_pre]:data-[component=true]:max-h-[calc(100svh-25rem)]',
									get code() {
										return $$props.component.code.highlighted.content;
									},

									get 'data-component'() {
										return $.get($0);
									}
								});
							}

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				var node_16 = $.sibling(node_13, 2);

				{
					var consequent_3 = ($$anchor) => {
						var fragment_7 = $.comment();
						var node_17 = $.first_child(fragment_7);

						$.component(node_17, () => Tab.TabsContent, ($$anchor, Tab_TabsContent_1) => {
							Tab_TabsContent_1($$anchor, {
								value: 'dependencies',
								children: ($$anchor, $$slotProps) => {
									var div_10 = root_4();

									$.each(div_10, 21, () => $$props.component.componentDependencies.list, (dependency) => dependency.name, ($$anchor, dependency) => {
										ComponentDependency($$anchor, {
											get dependency() {
												return $.get(dependency);
											}
										});
									});

									$.reset(div_10);
									$.append($$anchor, div_10);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_7);
					};

					$.if(node_16, ($$render) => {
						if ($$props.component.componentDependencies.list.length > 0) $$render(consequent_3);
					});
				}

				$.reset(div_9);
				$.bind_this(div_9, ($$value) => $.set(dialogRef, $$value), () => $.get(dialogRef));
				$.reset(div_8);
				$.bind_this(div_8, ($$value) => $.set(wrapperRef, $$value), () => $.get(wrapperRef));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_7);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $$props.component.name);
		$.set_text(text_1, $$props.component.directory);
		$.set_text(text_2, $$props.component.path);
	});

	$.append($$anchor, div);
	$.pop();
}