import * as $ from 'svelte/internal/server';
import { NodeViewWrapper } from '../../tiptap/index.js';
import { AudioLines, Video, Image, CodeXml } from '@lucide/svelte';
import Popover from '../primitives/Popover.svelte';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../primitives/tabs/index.ts';

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
				class: 'placeholder-wrapper',
				children: ($$renderer) => {
					const Icon = mediaTypeData()?.icon;
					const text = mediaTypeData()?.text;

					{
						function trigger($$renderer) {
							$$renderer.push(`<div role="button"${$.attr('tabindex', 1)} class="placeholder-card svelte-nc35b8">`);

							if (Icon) {
								$$renderer.push('<!--[-->');
								Icon($$renderer, { class: 'icon' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` <span class="text-span svelte-nc35b8"${$.attr('contenteditable', false)}>${$.escape(text)}</span></div>`);
						}

						Popover($$renderer, {
							class: 'popover-container',
							get open() {
								return open;
							},

							set open($$value) {
								open = $$value;
								$$settled = false;
							},
							trigger,
							children: ($$renderer) => {
								Tabs($$renderer, {
									value: 'link',
									class: 'tabs-container',
									children: ($$renderer) => {
										TabsList($$renderer, {
											class: 'tabs-list-margin',
											children: ($$renderer) => {
												TabsTrigger($$renderer, {
													value: 'link',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Link`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												if (mediaType() !== 'iframe') {
													$$renderer.push('<!--[0-->');

													TabsTrigger($$renderer, {
														value: 'file',
														children: ($$renderer) => {
															$$renderer.push(`<!---->File`);
														},
														$$slots: { default: true }
													});
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										TabsContent($$renderer, {
											value: 'link',
											children: ($$renderer) => {
												$$renderer.push(`<form class="form-container svelte-nc35b8"><input type="url"${$.attr('value', url)} class="edra-input" placeholder="Paste URL here..." required=""/> <button type="submit" class="edra-btn edra-btn-primary h-8-btn svelte-nc35b8">Insert ${$.escape(mediaType())}</button></form>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (mediaType() !== 'iframe') {
											$$renderer.push('<!--[0-->');

											TabsContent($$renderer, {
												value: 'file',
												children: ($$renderer) => {
													$$renderer.push(`<form class="form-container svelte-nc35b8"><input type="file" class="edra-input file-input svelte-nc35b8" required=""/> <button type="submit" class="edra-btn edra-btn-primary h-8-btn svelte-nc35b8">Insert ${$.escape(mediaType())}</button></form>`);
												},
												$$slots: { default: true }
											});
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}