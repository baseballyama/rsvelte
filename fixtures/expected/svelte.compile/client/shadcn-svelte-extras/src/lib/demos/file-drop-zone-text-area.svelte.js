import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';
import { buttonVariants } from '$lib/components/ui/button';
import * as FileDropZone from '$lib/components/ui/file-drop-zone';
import * as Select from '$lib/components/ui/select';
import ImageIcon from '@lucide/svelte/icons/image';
import SendIcon from '@lucide/svelte/icons/send-horizontal';
import XIcon from '@lucide/svelte/icons/x';
import { cn } from '$lib/utils';
import { slide } from 'svelte/transition';

var root = $.from_html(`<div class="group relative"><div class="border-border bg-secondary size-16 overflow-hidden rounded-lg border"><img class="h-full w-full object-cover"/></div> <!></div>`);
var root_1 = $.from_html(`<div class="flex flex-wrap gap-2 px-1"></div>`);
var root_2 = $.from_html(`<textarea></textarea>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="bg-card border-border flex flex-col gap-3 rounded-xl border p-3"><!> <!> <div class="flex items-center justify-between gap-2"><div class="flex items-center gap-2"><!> <!></div> <!></div></div>`);
var root_5 = $.from_html(`<div class="flex w-full flex-col gap-4 p-6"><!></div>`);

export default function File_drop_zone_text_area($$anchor, $$props) {
	$.push($$props, true);

	const models = [
		{ value: 'claude-opus-4', label: 'Claude Opus 4' },
		{ value: 'claude-sonnet-4', label: 'Claude Sonnet 4' },
		{ value: 'gpt-4o', label: 'GPT-4o' },
		{ value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
		{ value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }
	];

	let files = $.state($.proxy([]));
	let prompt = $.state('');
	let selectedModel = $.state('claude-opus-4');

	const onUpload = async (newFiles) => {
		for (const file of newFiles) {
			// don't upload duplicate files
			if ($.get(files).find((f) => f.name === file.name)) continue;

			$.get(files).push({
				name: file.name,
				type: file.type,
				size: file.size,
				url: URL.createObjectURL(file)
			});
		}
	};

	const removeFile = (index) => {
		const file = $.get(files)[index];

		URL.revokeObjectURL(file.url);

		$.set(
			files,
			[
				...$.get(files).slice(0, index),
				...$.get(files).slice(index + 1)
			],
			true
		);
	};

	var div = root_5();
	var node = $.child(div);

	$.component(node, () => FileDropZone.Root, ($$anchor, FileDropZone_Root) => {
		FileDropZone_Root($$anchor, {
			onUpload,
			accept: 'image/*',
			maxFiles: 4,
			get fileCount() {
				return $.get(files).length;
			},

			children: ($$anchor, $$slotProps) => {
				var div_1 = root_4();
				var node_1 = $.child(div_1);

				{
					var consequent = ($$anchor) => {
						var div_2 = root_1();

						$.each(div_2, 23, () => $.get(files), (file) => file.name, ($$anchor, file, i) => {
							var div_3 = root();
							var div_4 = $.child(div_3);
							var img = $.only_child(div_4);
							var node_2 = $.sibling(div_4, 2);

							Button(node_2, {
								size: 'icon',
								variant: 'secondary',
								onclick: () => removeFile($.get(i)),
								class: 'absolute -top-1.5 -right-1.5 size-5 rounded-full opacity-0 transition-opacity group-hover:opacity-100',
								children: ($$anchor, $$slotProps) => {
									XIcon($$anchor, { class: 'size-3' });
								},
								$$slots: { default: true }
							});

							$.reset(div_3);

							$.template_effect(() => {
								$.set_attribute(img, 'src', $.get(file).url);
								$.set_attribute(img, 'alt', $.get(file).name);
							});

							$.append($$anchor, div_3);
						});

						$.reset(div_2);
						$.transition(3, div_2, () => slide, () => ({ duration: 200 }));
						$.append($$anchor, div_2);
					};

					$.if(node_1, ($$render) => {
						if ($.get(files).length > 0) $$render(consequent);
					});
				}

				var node_3 = $.sibling(node_1, 2);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;
						var textarea = root_2();

						$.remove_textarea_child(textarea);

						$.attribute_effect(textarea, () => ({
							...props(),
							placeholder: 'Ask me anything...',
							class: 'placeholder:text-muted-foreground min-h-[44px] w-full resize-none border-0 bg-transparent text-[15px] focus:outline-none',
							rows: 1
						}));

						$.bind_value(textarea, () => $.get(prompt), ($$value) => $.set(prompt, $$value));
						$.append($$anchor, textarea);
					};

					$.component(node_3, () => FileDropZone.Textarea, ($$anchor, FileDropZone_Textarea) => {
						FileDropZone_Textarea($$anchor, { child, $$slots: { child: true } });
					});
				}

				var div_5 = $.sibling(node_3, 2);
				var div_6 = $.child(div_5);
				var node_4 = $.child(div_6);

				$.component(node_4, () => Select.Root, ($$anchor, Select_Root) => {
					Select_Root($$anchor, {
						type: 'single',
						get value() {
							return $.get(selectedModel);
						},

						set value($$value) {
							$.set(selectedModel, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_3();
							var node_5 = $.first_child(fragment_1);

							$.component(node_5, () => Select.Trigger, ($$anchor, Select_Trigger) => {
								Select_Trigger($$anchor, {
									size: 'sm',
									class: 'border-none',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(($0) => $.set_text(text, $0), [
											() => models.find((m) => m.value === $.get(selectedModel))?.label
										]);

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => Select.Content, ($$anchor, Select_Content) => {
								Select_Content($$anchor, {
									align: 'start',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_7 = $.first_child(fragment_3);

										$.each(node_7, 17, () => models, (model) => model.value, ($$anchor, model) => {
											var fragment_4 = $.comment();
											var node_8 = $.first_child(fragment_4);

											$.component(node_8, () => Select.Item, ($$anchor, Select_Item) => {
												Select_Item($$anchor, {
													get value() {
														return $.get(model).value;
													},

													get label() {
														return $.get(model).label;
													}
												});
											});

											$.append($$anchor, fragment_4);
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_9 = $.sibling(node_4, 2);

				{
					let $0 = $.derived(() => cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'bg-accent size-8 cursor-pointer'));

					$.component(node_9, () => FileDropZone.Trigger, ($$anchor, FileDropZone_Trigger) => {
						FileDropZone_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								ImageIcon($$anchor, { class: 'text-muted-foreground size-5' });
							},
							$$slots: { default: true }
						});
					});
				}

				$.reset(div_6);

				var node_10 = $.sibling(div_6, 2);

				Button(node_10, {
					variant: 'destructive',
					size: 'icon',
					class: 'size-8',
					children: ($$anchor, $$slotProps) => {
						SendIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$.reset(div_5);
				$.reset(div_1);
				$.append($$anchor, div_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}