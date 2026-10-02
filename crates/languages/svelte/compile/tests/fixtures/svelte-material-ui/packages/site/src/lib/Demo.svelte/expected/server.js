import * as $ from 'svelte/internal/server';
import { mdiGithub, mdiCodeTags, mdiCodeTagsCheck, mdiContentCopy } from '@mdi/js';
import Highlight, { HighlightSvelte } from 'svelte-highlight';
import scss from 'svelte-highlight/languages/scss';
import typescript from 'svelte-highlight/languages/typescript';
import Card, { Content, Actions, ActionIcons } from '@smui/card';
import CircularProgress from '@smui/circular-progress';
import IconButton, { Icon } from '@smui/icon-button';
import Tooltip, { Wrapper, Label } from '@smui/tooltip';

export default function Demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			file,
			files = typeof file === 'string' ? [file] : [],
			component: DemoComponent,
			children,
			subtitle
		} = $$props;

		let loadSourceView = false;
		let hide = true;
		let sources = Object.fromEntries(files.map((file) => [file, null]));

		async function loadSources() {
			loadSourceView = true;

			for (let curFile of files) {
				const url = `https://raw.githubusercontent.com/hperrin/svelte-material-ui/master/packages/site/src/routes/demo/${curFile}`;

				try {
					const result = await fetch(url);

					if (result.ok) {
						sources[curFile] = await result.text();
					} else {
						sources[curFile] = `Error: ${result.status} ${result.statusText}`;
					}
				} catch(e) {
					sources[curFile] = `Error: ${e.message}`;
				}
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Card($$renderer, {
				class: 'demo-spaced',
				children: ($$renderer) => {
					Content($$renderer, {
						children: ($$renderer) => {
							if (children) {
								$$renderer.push(`<!--[0--><h6 class="mdc-typography--headline6" style="margin: 0 0 10px;">`);
								children($$renderer);
								$$renderer.push(`<!----></h6>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (subtitle) {
								$$renderer.push(`<!--[0--><p class="mdc-typography--subtitle2" style="margin: 0 0 10px; color: #888;">`);
								subtitle($$renderer);
								$$renderer.push(`<!----></p>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (typeof DemoComponent === 'string') {
								$$renderer.push(`<!--[0--><em>${$.escape(DemoComponent)}</em>`);
							} else {
								$$renderer.push(`<!--[-1--><div>`);

								if (DemoComponent) {
									$$renderer.push('<!--[-->');
									DemoComponent($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(`</div>`);
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (loadSourceView) {
						$$renderer.push(`<!--[0--><!--[-->`);

						const each_array = $.ensure_array_like(Object.entries(sources));

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let [curFile, curSource] = each_array[$$index];

							Content($$renderer, {
								style: `display: ${hide ? 'none' : 'block'};`,
								children: ($$renderer) => {
									if (curSource == null) {
										$$renderer.push(`<!--[0--><div style="display: flex; justify-content: center">`);
										CircularProgress($$renderer, { style: 'height: 48px; width: 48px;', indeterminate: true });
										$$renderer.push(`<!----></div>`);
									} else {
										$$renderer.push(`<!--[-1--><div class="demo-file svelte-1sqykeq"><div class="demo-file-source svelte-1sqykeq">`);

										if (curFile.endsWith('.scss')) {
											$$renderer.push('<!--[0-->');
											Highlight($$renderer, { language: scss, code: curSource });
										} else if (curFile.endsWith('.ts')) {
											$$renderer.push('<!--[1-->');
											Highlight($$renderer, { language: typescript, code: curSource });
										} else {
											$$renderer.push('<!--[-1-->');
											HighlightSvelte($$renderer, { code: curSource });
										}

										$$renderer.push(`<!--]--></div> <div class="demo-file-footer svelte-1sqykeq"><a${$.attr('href', `https://github.com/hperrin/svelte-material-ui/blob/master/packages/site/src/routes/demo/${curFile}`)} target="_blank" class="svelte-1sqykeq">${$.escape(curFile)}</a> `);

										Wrapper($$renderer, {
											children: ($$renderer) => {
												IconButton($$renderer, {
													onclick: () => navigator.clipboard.writeText(curSource),
													size: 'button',
													children: ($$renderer) => {
														Icon($$renderer, {
															tag: 'svg',
															viewBox: '0 0 24 24',
															children: ($$renderer) => {
																$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiContentCopy)}></path>`);
															},
															$$slots: { default: true }
														});
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Tooltip($$renderer, {
													children: ($$renderer) => {
														Label($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Copy source code`);
															},
															$$slots: { default: true }
														});
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div></div>`);
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					Actions($$renderer, {
						children: ($$renderer) => {
							ActionIcons($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_1 = $.ensure_array_like(files);

									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
										let file = each_array_1[$$index_1];

										Wrapper($$renderer, {
											children: ($$renderer) => {
												IconButton($$renderer, {
													href: `https://github.com/hperrin/svelte-material-ui/blob/master/packages/site/src/routes/demo/${file}`,
													target: '_blank',
													children: ($$renderer) => {
														Icon($$renderer, {
															tag: 'svg',
															viewBox: '0 0 24 24',
															children: ($$renderer) => {
																$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiGithub)}></path>`);
															},
															$$slots: { default: true }
														});
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Tooltip($$renderer, {
													children: ($$renderer) => {
														Label($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->View ${$.escape(file)} on GitHub`);
															},
															$$slots: { default: true }
														});
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]--> `);

									Wrapper($$renderer, {
										children: ($$renderer) => {
											IconButton($$renderer, {
												toggle: true,
												onclick: loadSources,
												get pressed() {
													return hide;
												},

												set pressed($$value) {
													hide = $$value;
													$$settled = false;
												},

												children: ($$renderer) => {
													Icon($$renderer, {
														tag: 'svg',
														viewBox: '0 0 24 24',
														on: true,
														children: ($$renderer) => {
															$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiCodeTags)}></path>`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													Icon($$renderer, {
														tag: 'svg',
														viewBox: '0 0 24 24',
														children: ($$renderer) => {
															$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiCodeTagsCheck)}></path>`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!---->`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Tooltip($$renderer, {
												children: ($$renderer) => {
													Label($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(hide ? 'Show' : 'Hide')} the source code`);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
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