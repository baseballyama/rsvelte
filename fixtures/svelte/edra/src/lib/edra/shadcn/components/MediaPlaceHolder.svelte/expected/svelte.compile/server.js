import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button/index.js';
import { NodeViewWrapper } from '../../tiptap/index.js';
import { AudioLines, Video, Image, CodeXml } from '@lucide/svelte';
import * as Popover from '$lib/components/ui/popover/index.js';
import * as Tabs from '$lib/components/ui/tabs/index.js';
import { Input } from '$lib/components/ui/input/index.js';

export default function MediaPlaceHolder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { editor, node } = $$props;
		let open = false;
		const mediaType = $.derived(() => node.attrs.mediaType);
		let url = '';
		let files = void 0;

		function handleFileSubmit(e) {
			e.preventDefault();

			const file = files?.[0];

			if (file) {
				editor.commands.uploadMedia(file);
				open = false;
			}
		}

		const mediaTypeData = $.derived(() => {
			switch (mediaType()) {
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
			if (mediaType() === 'audio') {
				editor.chain().focus().setAudio({ src }).run();
			} else if (mediaType() === 'video') {
				editor.chain().focus().setVideo({ src }).run();
			} else if (mediaType() === 'image') {
				editor.chain().focus().setImage({ src }).run();
			} else if (mediaType() === 'iframe') {
				editor.chain().focus().setIframe({ src }).run();
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			NodeViewWrapper($$renderer, {
				class: 'my-2 w-full!',
				children: ($$renderer) => {
					const Icon = mediaTypeData()?.icon;
					const text = mediaTypeData()?.text;

					$$renderer.push(`<div role="button"${$.attr('tabindex', 1)} class="flex min-h-14 w-full items-center gap-2 rounded-lg border border-dashed bg-muted/30 p-4 transition-colors hover:bg-muted/50">`);

					if (Icon) {
						$$renderer.push('<!--[-->');
						Icon($$renderer, { class: 'size-4 text-muted-foreground' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` <span class="text-sm text-muted-foreground"${$.attr('contenteditable', false)}>${$.escape(text)}</span> `);

					if (Popover.Root) {
						$$renderer.push('<!--[-->');

						Popover.Root($$renderer, {
							get open() {
								return open;
							},

							set open($$value) {
								open = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Popover.Trigger) {
									$$renderer.push('<!--[-->');
									Popover.Trigger($$renderer, { class: 'sr-only left-1/2' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Popover.Content) {
									$$renderer.push('<!--[-->');

									Popover.Content($$renderer, {
										portalProps: { to: undefined },
										children: ($$renderer) => {
											if (Tabs.Root) {
												$$renderer.push('<!--[-->');

												Tabs.Root($$renderer, {
													value: 'link',
													class: 'w-full',
													children: ($$renderer) => {
														if (Tabs.List) {
															$$renderer.push('<!--[-->');

															Tabs.List($$renderer, {
																children: ($$renderer) => {
																	if (Tabs.Trigger) {
																		$$renderer.push('<!--[-->');

																		Tabs.Trigger($$renderer, {
																			value: 'link',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Link`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (mediaType() !== 'iframe') {
																		$$renderer.push('<!--[0-->');

																		if (Tabs.Trigger) {
																			$$renderer.push('<!--[-->');

																			Tabs.Trigger($$renderer, {
																				value: 'file',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->File`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	} else {
																		$$renderer.push('<!--[-1-->');
																	}

																	$$renderer.push(`<!--]-->`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Tabs.Content) {
															$$renderer.push('<!--[-->');

															Tabs.Content($$renderer, {
																value: 'link',
																children: ($$renderer) => {
																	$$renderer.push(`<form class="flex flex-col gap-2">`);

																	Input($$renderer, {
																		type: 'url',
																		get value() {
																			return url;
																		},

																		set value($$value) {
																			url = $$value;
																			$$settled = false;
																		}
																	});

																	$$renderer.push(`<!----> `);

																	Button($$renderer, {
																		type: 'submit',
																		class: 'capitalize',
																		onclick: () => setMediaFn(url),
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Insert ${$.escape(mediaType())}`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!----></form>`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (mediaType() !== 'iframe') {
															$$renderer.push('<!--[0-->');

															if (Tabs.Content) {
																$$renderer.push('<!--[-->');

																Tabs.Content($$renderer, {
																	value: 'file',
																	children: ($$renderer) => {
																		$$renderer.push(`<form class="flex flex-col gap-2">`);

																		Input($$renderer, {
																			type: 'file',
																			get files() {
																				return files;
																			},

																			set files($$value) {
																				files = $$value;
																				$$settled = false;
																			}
																		});

																		$$renderer.push(`<!----> `);

																		Button($$renderer, {
																			type: 'submit',
																			class: 'capitalize',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Insert ${$.escape(mediaType())}`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!----></form>`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]-->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div>`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}