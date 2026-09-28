import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NodeViewWrapper } from '../../tiptap/index.js';
import { AudioLines, Video, Image, CodeXml } from '@lucide/svelte';
import Popover from '../primitives/Popover.svelte';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../primitives/tabs/index.ts';

var root = $.from_html(`<div role="button" class="placeholder-card svelte-nc35b8"><!> <span class="text-span svelte-nc35b8"> </span></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<form class="form-container svelte-nc35b8"><input type="url" class="edra-input" placeholder="Paste URL here..." required=""/> <button type="submit" class="edra-btn edra-btn-primary h-8-btn svelte-nc35b8"> </button></form>`);
var root_3 = $.from_html(`<form class="form-container svelte-nc35b8"><input type="file" class="edra-input file-input svelte-nc35b8" required=""/> <button type="submit" class="edra-btn edra-btn-primary h-8-btn svelte-nc35b8"> </button></form>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function MediaPlaceHolder($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);
	const mediaType = $.derived(() => $$props.node.attrs.mediaType);
	let url = $.state('');
	let files = $.state(void 0);

	function handleFileSubmit(e) {
		e.preventDefault();

		const file = $.get(files)?.[0];

		if (file) {
			$$props.editor.commands.uploadMedia(file);
			$.set(open, false);
		}
	}

	const mediaTypeData = $.derived(() => {
		switch ($.get(mediaType)) {
			case 'audio':
				return { icon: AudioLines, text: 'Insert An Audio File' };

			case 'video':
				return { icon: Video, text: 'Insert An Video File' };

			case 'image':
				return { icon: Image, text: 'Insert An Image File' };

			case 'iframe':
				return { icon: CodeXml, text: 'Insert An IFrame' };
		}
	});

	function setMediaFn(src) {
		if ($.get(mediaType) === 'audio') {
			$$props.editor.chain().focus().setAudio({ src }).run();
		} else if ($.get(mediaType) === 'video') {
			$$props.editor.chain().focus().setVideo({ src }).run();
		} else if ($.get(mediaType) === 'image') {
			$$props.editor.chain().focus().setImage({ src }).run();
		} else if ($.get(mediaType) === 'iframe') {
			$$props.editor.chain().focus().setIframe({ src }).run();
		}
	}

	NodeViewWrapper($$anchor, {
		class: 'placeholder-wrapper',
		children: ($$anchor, $$slotProps) => {
			const Icon = $.derived(() => $.get(mediaTypeData)?.icon);
			const text = $.derived(() => $.get(mediaTypeData)?.text);

			{
				const trigger = ($$anchor) => {
					var div = root();

					$.set_attribute(div, 'tabindex', 1);

					var node_1 = $.child(div);

					$.component(node_1, () => $.get(Icon), ($$anchor, Icon_1) => {
						Icon_1($$anchor, { class: 'icon' });
					});

					var span = $.sibling(node_1, 2);

					$.set_attribute(span, 'contenteditable', false);

					var text_1 = $.only_child(span, true);

					$.reset(div);
					$.template_effect(() => $.set_text(text_1, $.get(text)));
					$.append($$anchor, div);
				};

				Popover($$anchor, {
					class: 'popover-container',
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},
					trigger,
					children: ($$anchor, $$slotProps) => {
						Tabs($$anchor, {
							value: 'link',
							class: 'tabs-container',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_4();
								var node_2 = $.first_child(fragment_3);

								TabsList(node_2, {
									class: 'tabs-list-margin',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_3 = $.first_child(fragment_4);

										TabsTrigger(node_3, {
											value: 'link',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Link');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});

										var node_4 = $.sibling(node_3, 2);

										{
											var consequent = ($$anchor) => {
												TabsTrigger($$anchor, {
													value: 'file',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text('File');

														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});
											};

											$.if(node_4, ($$render) => {
												if ($.get(mediaType) !== 'iframe') $$render(consequent);
											});
										}

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});

								var node_5 = $.sibling(node_2, 2);

								TabsContent(node_5, {
									value: 'link',
									children: ($$anchor, $$slotProps) => {
										var form = root_2();
										var input = $.child(form);

										$.remove_input_defaults(input);

										var button = $.sibling(input, 2);
										var text_4 = $.only_child(button);

										$.reset(form);
										$.template_effect(() => $.set_text(text_4, `Insert ${$.get(mediaType) ?? ''}`));

										$.event('submit', form, (e) => {
											e.preventDefault();
											setMediaFn($.get(url));
											$.set(open, false);
										});

										$.bind_value(input, () => $.get(url), ($$value) => $.set(url, $$value));
										$.append($$anchor, form);
									},
									$$slots: { default: true }
								});

								var node_6 = $.sibling(node_5, 2);

								{
									var consequent_1 = ($$anchor) => {
										TabsContent($$anchor, {
											value: 'file',
											children: ($$anchor, $$slotProps) => {
												var form_1 = root_3();
												var input_1 = $.child(form_1);
												var button_1 = $.sibling(input_1, 2);
												var text_5 = $.only_child(button_1);

												$.reset(form_1);
												$.template_effect(() => $.set_text(text_5, `Insert ${$.get(mediaType) ?? ''}`));
												$.event('submit', form_1, handleFileSubmit);
												$.bind_files(input_1, () => $.get(files), ($$value) => $.set(files, $$value));
												$.append($$anchor, form_1);
											},
											$$slots: { default: true }
										});
									};

									$.if(node_6, ($$render) => {
										if ($.get(mediaType) !== 'iframe') $$render(consequent_1);
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { trigger: true, default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	$.pop();
}