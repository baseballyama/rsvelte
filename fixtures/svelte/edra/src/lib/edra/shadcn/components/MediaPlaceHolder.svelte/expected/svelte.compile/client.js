import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { NodeViewWrapper } from '../../tiptap/index.js';
import { AudioLines, Video, Image, CodeXml } from '@lucide/svelte';
import * as Popover from '$lib/components/ui/popover/index.js';
import * as Tabs from '$lib/components/ui/tabs/index.js';
import { Input } from '$lib/components/ui/input/index.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<form class="flex flex-col gap-2"><!> <!></form>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div role="button" class="flex min-h-14 w-full items-center gap-2 rounded-lg border border-dashed bg-muted/30 p-4 transition-colors hover:bg-muted/50"><!> <span class="text-sm text-muted-foreground"> </span> <!></div>`);

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
		class: 'my-2 w-full!',
		children: ($$anchor, $$slotProps) => {
			const Icon = $.derived(() => $.get(mediaTypeData)?.icon);
			const text = $.derived(() => $.get(mediaTypeData)?.text);
			var div = root_3();

			$.set_attribute(div, 'tabindex', 1);

			var node_1 = $.child(div);

			$.component(node_1, () => $.get(Icon), ($$anchor, Icon_1) => {
				Icon_1($$anchor, { class: 'size-4 text-muted-foreground' });
			});

			var span = $.sibling(node_1, 2);

			$.set_attribute(span, 'contenteditable', false);

			var text_1 = $.only_child(span, true);
			var node_2 = $.sibling(span, 2);

			$.component(node_2, () => Popover.Root, ($$anchor, Popover_Root) => {
				Popover_Root($$anchor, {
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_3 = $.first_child(fragment_1);

						$.component(node_3, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
							Popover_Trigger($$anchor, { class: 'sr-only left-1/2' });
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Popover.Content, ($$anchor, Popover_Content) => {
							Popover_Content($$anchor, {
								portalProps: { to: undefined },
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = $.comment();
									var node_5 = $.first_child(fragment_2);

									$.component(node_5, () => Tabs.Root, ($$anchor, Tabs_Root) => {
										Tabs_Root($$anchor, {
											value: 'link',
											class: 'w-full',
											children: ($$anchor, $$slotProps) => {
												var fragment_3 = root_2();
												var node_6 = $.first_child(fragment_3);

												$.component(node_6, () => Tabs.List, ($$anchor, Tabs_List) => {
													Tabs_List($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_4 = root();
															var node_7 = $.first_child(fragment_4);

															$.component(node_7, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
																Tabs_Trigger($$anchor, {
																	value: 'link',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Link');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															var node_8 = $.sibling(node_7, 2);

															{
																var consequent = ($$anchor) => {
																	var fragment_5 = $.comment();
																	var node_9 = $.first_child(fragment_5);

																	$.component(node_9, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
																		Tabs_Trigger_1($$anchor, {
																			value: 'file',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_3 = $.text('File');

																				$.append($$anchor, text_3);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_5);
																};

																$.if(node_8, ($$render) => {
																	if ($.get(mediaType) !== 'iframe') $$render(consequent);
																});
															}

															$.append($$anchor, fragment_4);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_6, 2);

												$.component(node_10, () => Tabs.Content, ($$anchor, Tabs_Content) => {
													Tabs_Content($$anchor, {
														value: 'link',
														children: ($$anchor, $$slotProps) => {
															var form = root_1();
															var node_11 = $.child(form);

															Input(node_11, {
																type: 'url',
																get value() {
																	return $.get(url);
																},

																set value($$value) {
																	$.set(url, $$value, true);
																}
															});

															var node_12 = $.sibling(node_11, 2);

															Button(node_12, {
																type: 'submit',
																class: 'capitalize',
																onclick: () => setMediaFn($.get(url)),
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_4 = $.text();

																	$.template_effect(() => $.set_text(text_4, `Insert ${$.get(mediaType) ?? ''}`));
																	$.append($$anchor, text_4);
																},
																$$slots: { default: true }
															});

															$.reset(form);
															$.append($$anchor, form);
														},
														$$slots: { default: true }
													});
												});

												var node_13 = $.sibling(node_10, 2);

												{
													var consequent_1 = ($$anchor) => {
														var fragment_7 = $.comment();
														var node_14 = $.first_child(fragment_7);

														$.component(node_14, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
															Tabs_Content_1($$anchor, {
																value: 'file',
																children: ($$anchor, $$slotProps) => {
																	var form_1 = root_1();
																	var node_15 = $.child(form_1);

																	Input(node_15, {
																		type: 'file',
																		get files() {
																			return $.get(files);
																		},

																		set files($$value) {
																			$.set(files, $$value, true);
																		}
																	});

																	var node_16 = $.sibling(node_15, 2);

																	Button(node_16, {
																		type: 'submit',
																		class: 'capitalize',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_5 = $.text();

																			$.template_effect(() => $.set_text(text_5, `Insert ${$.get(mediaType) ?? ''}`));
																			$.append($$anchor, text_5);
																		},
																		$$slots: { default: true }
																	});

																	$.reset(form_1);
																	$.event('submit', form_1, handleFileSubmit);
																	$.append($$anchor, form_1);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_7);
													};

													$.if(node_13, ($$render) => {
														if ($.get(mediaType) !== 'iframe') $$render(consequent_1);
													});
												}

												$.append($$anchor, fragment_3);
											},
											$$slots: { default: true }
										});
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

			$.reset(div);
			$.template_effect(() => $.set_text(text_1, $.get(text)));
			$.delegated('click', div, () => $.set(open, true));
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);