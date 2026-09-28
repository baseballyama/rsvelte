import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mdiGithub, mdiCodeTags, mdiCodeTagsCheck, mdiContentCopy } from '@mdi/js';
import Highlight, { HighlightSvelte } from 'svelte-highlight';
import scss from 'svelte-highlight/languages/scss';
import typescript from 'svelte-highlight/languages/typescript';
import Card, { Content, Actions, ActionIcons } from '@smui/card';
import CircularProgress from '@smui/circular-progress';
import IconButton, { Icon } from '@smui/icon-button';
import Tooltip, { Wrapper, Label } from '@smui/tooltip';

var root = $.from_html(`<h6 class="mdc-typography--headline6" style="margin: 0 0 10px;"><!></h6>`);
var root_1 = $.from_html(`<p class="mdc-typography--subtitle2" style="margin: 0 0 10px; color: #888;"><!></p>`);
var root_2 = $.from_html(`<em> </em>`);
var root_3 = $.from_html(`<div><!></div>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<div style="display: flex; justify-content: center"><!></div>`);
var root_6 = $.from_svg(`<path fill="currentColor"></path>`);
var root_7 = $.from_html(`<!> <!>`, 1);
var root_8 = $.from_html(`<div class="demo-file svelte-1sqykeq"><div class="demo-file-source svelte-1sqykeq"><!></div> <div class="demo-file-footer svelte-1sqykeq"><a target="_blank" class="svelte-1sqykeq"> </a> <!></div></div>`);

export default function Demo($$anchor, $$props) {
	$.push($$props, true);

	let files = $.prop($$props, 'files', 19, () => typeof $$props.file === 'string' ? [$$props.file] : []);
	let loadSourceView = $.state(false);
	let hide = $.state(true);
	let sources = $.proxy(Object.fromEntries(files().map((file) => [file, null])));

	async function loadSources() {
		$.set(loadSourceView, true);

		for (let curFile of files()) {
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

	Card($$anchor, {
		class: 'demo-spaced',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node = $.first_child(fragment_1);

			Content(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_4();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var h6 = root();
							var node_2 = $.child(h6);

							$.snippet(node_2, () => $$props.children);
							$.reset(h6);
							$.append($$anchor, h6);
						};

						$.if(node_1, ($$render) => {
							if ($$props.children) $$render(consequent);
						});
					}

					var node_3 = $.sibling(node_1, 2);

					{
						var consequent_1 = ($$anchor) => {
							var p = root_1();
							var node_4 = $.child(p);

							$.snippet(node_4, () => $$props.subtitle);
							$.reset(p);
							$.append($$anchor, p);
						};

						$.if(node_3, ($$render) => {
							if ($$props.subtitle) $$render(consequent_1);
						});
					}

					var node_5 = $.sibling(node_3, 2);

					{
						var consequent_2 = ($$anchor) => {
							var em = root_2();
							var text = $.only_child(em, true);

							$.template_effect(() => $.set_text(text, $$props.component));
							$.append($$anchor, em);
						};

						var alternate = ($$anchor) => {
							var div = root_3();
							var node_6 = $.child(div);

							$.component(node_6, () => $$props.component, ($$anchor, DemoComponent_1) => {
								DemoComponent_1($$anchor, {});
							});

							$.reset(div);
							$.append($$anchor, div);
						};

						$.if(node_5, ($$render) => {
							if (typeof $$props.component === 'string') $$render(consequent_2); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node, 2);

			{
				var consequent_6 = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_8 = $.first_child(fragment_3);

					$.each(node_8, 17, () => Object.entries(sources), $.index, ($$anchor, $$item) => {
						var $$array = $.derived(() => $.to_array($.get($$item), 2));
						let curFile = () => $.get($$array)[0];
						let curSource = () => $.get($$array)[1];

						{
							let $0 = $.derived(() => $.get(hide) ? 'none' : 'block');

							Content($$anchor, {
								get style() {
									return `display: ${$.get($0) ?? ''};`;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_9 = $.first_child(fragment_5);

									{
										var consequent_3 = ($$anchor) => {
											var div_1 = root_5();
											var node_10 = $.child(div_1);

											CircularProgress(node_10, { style: 'height: 48px; width: 48px;', indeterminate: true });
											$.reset(div_1);
											$.append($$anchor, div_1);
										};

										var alternate_2 = ($$anchor) => {
											var div_2 = root_8();
											var div_3 = $.child(div_2);
											var node_11 = $.child(div_3);

											{
												var consequent_4 = ($$anchor) => {
													Highlight($$anchor, {
														get language() {
															return scss;
														},

														get code() {
															return curSource();
														}
													});
												};

												var d = $.derived(() => curFile().endsWith('.scss'));

												var consequent_5 = ($$anchor) => {
													Highlight($$anchor, {
														get language() {
															return typescript;
														},

														get code() {
															return curSource();
														}
													});
												};

												var d_1 = $.derived(() => curFile().endsWith('.ts'));

												var alternate_1 = ($$anchor) => {
													HighlightSvelte($$anchor, {
														get code() {
															return curSource();
														}
													});
												};

												$.if(node_11, ($$render) => {
													if ($.get(d)) $$render(consequent_4); else if ($.get(d_1)) $$render(consequent_5, 1); else $$render(alternate_1, -1);
												});
											}

											$.reset(div_3);

											var div_4 = $.sibling(div_3, 2);
											var a = $.child(div_4);
											var text_1 = $.only_child(a, true);
											var node_12 = $.sibling(a, 2);

											Wrapper(node_12, {
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = root_7();
													var node_13 = $.first_child(fragment_9);

													IconButton(node_13, {
														onclick: () => navigator.clipboard.writeText(curSource()),
														size: 'button',
														children: ($$anchor, $$slotProps) => {
															Icon($$anchor, {
																tag: 'svg',
																viewBox: '0 0 24 24',
																children: ($$anchor, $$slotProps) => {
																	var path = root_6();

																	$.template_effect(() => $.set_attribute(path, 'd', mdiContentCopy));
																	$.append($$anchor, path);
																},
																$$slots: { default: true }
															});
														},
														$$slots: { default: true }
													});

													var node_14 = $.sibling(node_13, 2);

													Tooltip(node_14, {
														children: ($$anchor, $$slotProps) => {
															Label($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_2 = $.text('Copy source code');

																	$.append($$anchor, text_2);
																},
																$$slots: { default: true }
															});
														},
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});

											$.reset(div_4);
											$.reset(div_2);

											$.template_effect(() => {
												$.set_attribute(a, 'href', `https://github.com/hperrin/svelte-material-ui/blob/master/packages/site/src/routes/demo/${curFile()}`);
												$.set_text(text_1, curFile());
											});

											$.append($$anchor, div_2);
										};

										$.if(node_9, ($$render) => {
											if (curSource() == null) $$render(consequent_3); else $$render(alternate_2, -1);
										});
									}

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						}
					});

					$.append($$anchor, fragment_3);
				};

				$.if(node_7, ($$render) => {
					if ($.get(loadSourceView)) $$render(consequent_6);
				});
			}

			var node_15 = $.sibling(node_7, 2);

			Actions(node_15, {
				children: ($$anchor, $$slotProps) => {
					ActionIcons($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = root_7();
							var node_16 = $.first_child(fragment_13);

							$.each(node_16, 17, files, $.index, ($$anchor, file, $$index_1, $$array_1) => {
								Wrapper($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_15 = root_7();
										var node_17 = $.first_child(fragment_15);

										{
											let $0 = $.derived(() => `https://github.com/hperrin/svelte-material-ui/blob/master/packages/site/src/routes/demo/${$.get(file)}`);

											IconButton(node_17, {
												get href() {
													return $.get($0);
												},
												target: '_blank',
												children: ($$anchor, $$slotProps) => {
													Icon($$anchor, {
														tag: 'svg',
														viewBox: '0 0 24 24',
														children: ($$anchor, $$slotProps) => {
															var path_1 = root_6();

															$.template_effect(() => $.set_attribute(path_1, 'd', mdiGithub));
															$.append($$anchor, path_1);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});
										}

										var node_18 = $.sibling(node_17, 2);

										Tooltip(node_18, {
											children: ($$anchor, $$slotProps) => {
												Label($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text();

														$.template_effect(() => $.set_text(text_3, `View ${$.get(file) ?? ''} on GitHub`));
														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_15);
									},
									$$slots: { default: true }
								});
							});

							var node_19 = $.sibling(node_16, 2);

							Wrapper(node_19, {
								children: ($$anchor, $$slotProps) => {
									var fragment_19 = root_7();
									var node_20 = $.first_child(fragment_19);

									IconButton(node_20, {
										toggle: true,
										onclick: loadSources,
										get pressed() {
											return $.get(hide);
										},

										set pressed($$value) {
											$.set(hide, $$value, true);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_20 = root_7();
											var node_21 = $.first_child(fragment_20);

											Icon(node_21, {
												tag: 'svg',
												viewBox: '0 0 24 24',
												on: true,
												children: ($$anchor, $$slotProps) => {
													var path_2 = root_6();

													$.template_effect(() => $.set_attribute(path_2, 'd', mdiCodeTags));
													$.append($$anchor, path_2);
												},
												$$slots: { default: true }
											});

											var node_22 = $.sibling(node_21, 2);

											Icon(node_22, {
												tag: 'svg',
												viewBox: '0 0 24 24',
												children: ($$anchor, $$slotProps) => {
													var path_3 = root_6();

													$.template_effect(() => $.set_attribute(path_3, 'd', mdiCodeTagsCheck));
													$.append($$anchor, path_3);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_20);
										},
										$$slots: { default: true }
									});

									var node_23 = $.sibling(node_20, 2);

									Tooltip(node_23, {
										children: ($$anchor, $$slotProps) => {
											Label($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text();

													$.template_effect(() => $.set_text(text_4, `${$.get(hide) ? 'Show' : 'Hide'} the source code`));
													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_19);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}