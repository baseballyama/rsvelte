import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Button, Modal, Text } from "$lib/index.js";

import {
	modalDefault,
	modalDisabkedActions,
	modalSingleButton,
	modalSticky
} from "../../docs/data/modal.js";

import { ArrowLeft } from "$lib/icons/index.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const modal = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
};

const demoAndCode = ($$anchor, demo = $.noop, code = $.noop) => {
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.snippet(node, demo);
	$.reset(div_2);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	CollapseCode(node_1, {
		get code() {
			return code();
		}
	});

	$.reset(div);
	$.append($$anchor, div);
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "menu", href: "/menu" },
				next: { title: "note", href: "/note" }
			});
		},
		$$slots: { default: true }
	});
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">modal</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Display popup content that requires attention or provides additional information.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap gap-4"><!></div></div> <!></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div><!> <!></div>`);
var root_4 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_5 = $.from_html(`<div class="flex gap-3"><!> <!></div> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	const defaultModal = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_4();
				var node_2 = $.first_child(fragment_3);

				LinkH2(node_2, {
					href: '/modal#default',
					'aria-label': 'default',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('default');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var div_3 = $.sibling(node_2, 2);

				{
					const demo = ($$anchor) => {
						var div_4 = root_3();
						var node_3 = $.child(div_4);

						Button(node_3, {
							onclick: () => $.set(active, true),
							size: 'small',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Open Modal');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Modal.Root, ($$anchor, Modal_Root) => {
							Modal_Root($$anchor, {
								get active() {
									return $.get(active);
								},

								set active($$value) {
									$.set(active, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Modal.Content, ($$anchor, Modal_Content) => {
										Modal_Content($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_2();
												var node_6 = $.first_child(fragment_5);

												$.component(node_6, () => Modal.Body, ($$anchor, Modal_Body) => {
													Modal_Body($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_2();
															var node_7 = $.first_child(fragment_6);

															$.component(node_7, () => Modal.Header, ($$anchor, Modal_Header) => {
																Modal_Header($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_7 = root_2();
																		var node_8 = $.first_child(fragment_7);

																		$.component(node_8, () => Modal.Title, ($$anchor, Modal_Title) => {
																			Modal_Title($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_2 = $.text('Create Token');

																					$.append($$anchor, text_2);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_9 = $.sibling(node_8, 2);

																		$.component(node_9, () => Modal.Subtitle, ($$anchor, Modal_Subtitle) => {
																			Modal_Subtitle($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_3 = $.text('Enter a unique name for your token to differentiate it from other tokens\n										and then select the scope.');

																					$.append($$anchor, text_3);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_7);
																	},
																	$$slots: { default: true }
																});
															});

															var node_10 = $.sibling(node_7, 2);

															Text(node_10, {
																size: 14,
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_4 = $.text('Some content contained within the modal.');

																	$.append($$anchor, text_4);
																},
																$$slots: { default: true }
															});

															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												var node_11 = $.sibling(node_6, 2);

												$.component(node_11, () => Modal.Footer, ($$anchor, Modal_Footer) => {
													Modal_Footer($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root_2();
															var node_12 = $.first_child(fragment_8);

															Button(node_12, {
																onclick: () => $.set(active, false),
																variant: 'secondary',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_5 = $.text('Cancel');

																	$.append($$anchor, text_5);
																},
																$$slots: { default: true }
															});

															var node_13 = $.sibling(node_12, 2);

															Button(node_13, {
																onclick: () => $.set(active, false),
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_6 = $.text('Submit');

																	$.append($$anchor, text_6);
																},
																$$slots: { default: true }
															});

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_4);
						$.append($$anchor, div_4);
					};

					var node_14 = $.child(div_3);

					demoAndCode(node_14, () => demo, () => modalDefault);
					$.reset(div_3);
				}

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	};

	const sticky = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_10 = root_4();
				var node_15 = $.first_child(fragment_10);

				LinkH2(node_15, {
					href: '/modal#sticky',
					'aria-label': 'sticky',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text('sticky');

						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var div_5 = $.sibling(node_15, 2);

				{
					const demo = ($$anchor) => {
						var div_6 = root_3();
						var node_16 = $.child(div_6);

						Button(node_16, {
							onclick: () => $.set(activeSticky, true),
							size: 'small',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_8 = $.text('Open Modal');

								$.append($$anchor, text_8);
							},
							$$slots: { default: true }
						});

						var node_17 = $.sibling(node_16, 2);

						$.component(node_17, () => Modal.Root, ($$anchor, Modal_Root_1) => {
							Modal_Root_1($$anchor, {
								sticky: true,
								get active() {
									return $.get(activeSticky);
								},

								set active($$value) {
									$.set(activeSticky, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_11 = $.comment();
									var node_18 = $.first_child(fragment_11);

									$.component(node_18, () => Modal.Content, ($$anchor, Modal_Content_1) => {
										Modal_Content_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_12 = root_2();
												var node_19 = $.first_child(fragment_12);

												$.component(node_19, () => Modal.Body, ($$anchor, Modal_Body_1) => {
													Modal_Body_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_13 = root_2();
															var node_20 = $.first_child(fragment_13);

															$.component(node_20, () => Modal.Header, ($$anchor, Modal_Header_1) => {
																Modal_Header_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_14 = $.comment();
																		var node_21 = $.first_child(fragment_14);

																		$.component(node_21, () => Modal.Title, ($$anchor, Modal_Title_1) => {
																			Modal_Title_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_9 = $.text('Create Token');

																					$.append($$anchor, text_9);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_14);
																	},
																	$$slots: { default: true }
																});
															});

															var node_22 = $.sibling(node_20, 2);

															$.each(node_22, 16, () => Array(60), $.index, ($$anchor, $$item) => {
																Text($$anchor, {
																	size: 14,
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_10 = $.text('Some content contained within the modal.');

																		$.append($$anchor, text_10);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_13);
														},
														$$slots: { default: true }
													});
												});

												var node_23 = $.sibling(node_19, 2);

												$.component(node_23, () => Modal.Footer, ($$anchor, Modal_Footer_1) => {
													Modal_Footer_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_16 = root_5();
															var div_7 = $.first_child(fragment_16);
															var node_24 = $.child(div_7);

															Button(node_24, {
																onclick: () => $.set(activeSticky, false),
																variant: 'secondary',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_11 = $.text('Cancel');

																	$.append($$anchor, text_11);
																},
																$$slots: { default: true }
															});

															var node_25 = $.sibling(node_24, 2);

															{
																const prefix = ($$anchor) => {
																	ArrowLeft($$anchor, {});
																};

																Button(node_25, {
																	onclick: () => $.set(activeSticky, false),
																	variant: 'secondary',
																	prefix,
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_12 = $.text('Previous');

																		$.append($$anchor, text_12);
																	},
																	$$slots: { prefix: true, default: true }
																});
															}

															$.reset(div_7);

															var node_26 = $.sibling(div_7, 2);

															Button(node_26, {
																onclick: () => $.set(activeSticky, false),
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_13 = $.text('Submit');

																	$.append($$anchor, text_13);
																},
																$$slots: { default: true }
															});

															$.append($$anchor, fragment_16);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_12);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_6);
						$.append($$anchor, div_6);
					};

					var node_27 = $.child(div_5);

					demoAndCode(node_27, () => demo, () => modalSticky);
					$.reset(div_5);
				}

				$.append($$anchor, fragment_10);
			},
			$$slots: { default: true }
		});
	};

	const singleButton = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_19 = root_4();
				var node_28 = $.first_child(fragment_19);

				LinkH2(node_28, {
					href: '/modal#single-button',
					'aria-label': 'single-button',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_14 = $.text('single button');

						$.append($$anchor, text_14);
					},
					$$slots: { default: true }
				});

				var div_8 = $.sibling(node_28, 2);

				{
					const demo = ($$anchor) => {
						var div_9 = root_3();
						var node_29 = $.child(div_9);

						Button(node_29, {
							onclick: () => $.set(activeSingleButton, true),
							size: 'small',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_15 = $.text('Open Modal');

								$.append($$anchor, text_15);
							},
							$$slots: { default: true }
						});

						var node_30 = $.sibling(node_29, 2);

						$.component(node_30, () => Modal.Root, ($$anchor, Modal_Root_2) => {
							Modal_Root_2($$anchor, {
								get active() {
									return $.get(activeSingleButton);
								},

								set active($$value) {
									$.set(activeSingleButton, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_20 = $.comment();
									var node_31 = $.first_child(fragment_20);

									$.component(node_31, () => Modal.Content, ($$anchor, Modal_Content_2) => {
										Modal_Content_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_21 = root_2();
												var node_32 = $.first_child(fragment_21);

												$.component(node_32, () => Modal.Body, ($$anchor, Modal_Body_2) => {
													Modal_Body_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_22 = root_2();
															var node_33 = $.first_child(fragment_22);

															$.component(node_33, () => Modal.Header, ($$anchor, Modal_Header_2) => {
																Modal_Header_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_23 = $.comment();
																		var node_34 = $.first_child(fragment_23);

																		$.component(node_34, () => Modal.Title, ($$anchor, Modal_Title_2) => {
																			Modal_Title_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_16 = $.text('Create Token');

																					$.append($$anchor, text_16);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_23);
																	},
																	$$slots: { default: true }
																});
															});

															var node_35 = $.sibling(node_33, 2);

															Text(node_35, {
																size: 14,
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_17 = $.text('Some content contained within the modal.');

																	$.append($$anchor, text_17);
																},
																$$slots: { default: true }
															});

															$.append($$anchor, fragment_22);
														},
														$$slots: { default: true }
													});
												});

												var node_36 = $.sibling(node_32, 2);

												$.component(node_36, () => Modal.Footer, ($$anchor, Modal_Footer_2) => {
													Modal_Footer_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															Button($$anchor, {
																onclick: () => $.set(activeSingleButton, false),
																variant: 'secondary',
																class: 'w-full',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_18 = $.text('Cancel');

																	$.append($$anchor, text_18);
																},
																$$slots: { default: true }
															});
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_21);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_20);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_9);
						$.append($$anchor, div_9);
					};

					var node_37 = $.child(div_8);

					demoAndCode(node_37, () => demo, () => modalSingleButton);
					$.reset(div_8);
				}

				$.append($$anchor, fragment_19);
			},
			$$slots: { default: true }
		});
	};

	const disabled = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_26 = root_4();
				var node_38 = $.first_child(fragment_26);

				LinkH2(node_38, {
					href: '/modal#disabled-actions',
					'aria-label': 'disabled-actions',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_19 = $.text('disabled actions');

						$.append($$anchor, text_19);
					},
					$$slots: { default: true }
				});

				var div_10 = $.sibling(node_38, 2);

				{
					const demo = ($$anchor) => {
						var div_11 = root_3();
						var node_39 = $.child(div_11);

						Button(node_39, {
							onclick: () => $.set(activeDisabled, true),
							size: 'small',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_20 = $.text('Open Modal');

								$.append($$anchor, text_20);
							},
							$$slots: { default: true }
						});

						var node_40 = $.sibling(node_39, 2);

						$.component(node_40, () => Modal.Root, ($$anchor, Modal_Root_3) => {
							Modal_Root_3($$anchor, {
								get active() {
									return $.get(activeDisabled);
								},

								set active($$value) {
									$.set(activeDisabled, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_27 = $.comment();
									var node_41 = $.first_child(fragment_27);

									$.component(node_41, () => Modal.Content, ($$anchor, Modal_Content_3) => {
										Modal_Content_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_28 = root_2();
												var node_42 = $.first_child(fragment_28);

												$.component(node_42, () => Modal.Body, ($$anchor, Modal_Body_3) => {
													Modal_Body_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_29 = root_2();
															var node_43 = $.first_child(fragment_29);

															$.component(node_43, () => Modal.Header, ($$anchor, Modal_Header_3) => {
																Modal_Header_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_30 = root_2();
																		var node_44 = $.first_child(fragment_30);

																		$.component(node_44, () => Modal.Title, ($$anchor, Modal_Title_3) => {
																			Modal_Title_3($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_21 = $.text('Create Token');

																					$.append($$anchor, text_21);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_45 = $.sibling(node_44, 2);

																		$.component(node_45, () => Modal.Subtitle, ($$anchor, Modal_Subtitle_1) => {
																			Modal_Subtitle_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_22 = $.text('This is a modal.');

																					$.append($$anchor, text_22);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_30);
																	},
																	$$slots: { default: true }
																});
															});

															var node_46 = $.sibling(node_43, 2);

															Text(node_46, {
																size: 14,
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_23 = $.text('Some content contained within the modal.');

																	$.append($$anchor, text_23);
																},
																$$slots: { default: true }
															});

															$.append($$anchor, fragment_29);
														},
														$$slots: { default: true }
													});
												});

												var node_47 = $.sibling(node_42, 2);

												$.component(node_47, () => Modal.Footer, ($$anchor, Modal_Footer_3) => {
													Modal_Footer_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_31 = root_2();
															var node_48 = $.first_child(fragment_31);

															Button(node_48, {
																onclick: () => $.set(activeDisabled, false),
																variant: 'secondary',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_24 = $.text('Cancel');

																	$.append($$anchor, text_24);
																},
																$$slots: { default: true }
															});

															var node_49 = $.sibling(node_48, 2);

															Button(node_49, {
																disabled: true,
																onclick: () => $.set(activeDisabled, false),
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_25 = $.text('Submit');

																	$.append($$anchor, text_25);
																},
																$$slots: { default: true }
															});

															$.append($$anchor, fragment_31);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_28);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_27);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_11);
						$.append($$anchor, div_11);
					};

					var node_50 = $.child(div_10);

					demoAndCode(node_50, () => demo, () => modalDisabkedActions);
					$.reset(div_10);
				}

				$.append($$anchor, fragment_26);
			},
			$$slots: { default: true }
		});
	};

	const cont = ($$anchor) => {
		var fragment_34 = root_6();
		var node_51 = $.first_child(fragment_34);

		modal(node_51);

		var node_52 = $.sibling(node_51, 2);

		defaultModal(node_52);

		var node_53 = $.sibling(node_52, 2);

		sticky(node_53);

		var node_54 = $.sibling(node_53, 2);

		singleButton(node_54);

		var node_55 = $.sibling(node_54, 2);

		disabled(node_55);

		var node_56 = $.sibling(node_55, 2);

		prevAndNext(node_56);
		$.append($$anchor, fragment_34);
	};

	let active = $.state(false);
	let activeSticky = $.state(false);
	let activeSingleButton = $.state(false);
	let activeDisabled = $.state(false);

	$.head('hd132u', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Modal';
		});
	});

	Shell($$anchor, {
		get asideSlot() {
			return aside;
		},

		get contSlot() {
			return cont;
		}
	});
}