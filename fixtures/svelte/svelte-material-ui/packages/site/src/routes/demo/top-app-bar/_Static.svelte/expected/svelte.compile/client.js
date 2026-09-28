import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
import IconButton, { Icon } from '@smui/icon-button';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';
import LoremIpsum from '$lib/LoremIpsum.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div><!> <!> <!></div> <div class="flexy svelte-3e37l3"><div class="top-app-bar-container flexor svelte-3e37l3"><!> <div class="flexor-content svelte-3e37l3"><!> <img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/></div></div> <div class="top-app-bar-container svelte-3e37l3"><!> <div><!> <img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/></div></div></div>`, 1);

export default function _Static($$anchor) {
	let prominent = $.state(false);
	let dense = $.state(false);
	let secondaryColor = $.state(false);
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		const label = ($$anchor) => {
			$.next();

			var text = $.text('Prominent');

			$.append($$anchor, text);
		};

		FormField(node, {
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, {
					get checked() {
						return $.get(prominent);
					},

					set checked($$value) {
						$.set(prominent, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		const label = ($$anchor) => {
			$.next();

			var text_1 = $.text('Dense');

			$.append($$anchor, text_1);
		};

		FormField(node_1, {
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, {
					get checked() {
						return $.get(dense);
					},

					set checked($$value) {
						$.set(dense, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		const label = ($$anchor) => {
			$.next();

			var text_2 = $.text('Secondary');

			$.append($$anchor, text_2);
		};

		FormField(node_2, {
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, {
					get checked() {
						return $.get(secondaryColor);
					},

					set checked($$value) {
						$.set(secondaryColor, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var div_2 = $.child(div_1);
	var node_3 = $.child(div_2);

	{
		let $0 = $.derived(() => $.get(secondaryColor) ? 'secondary' : 'primary');

		TopAppBar(node_3, {
			variant: 'static',
			get prominent() {
				return $.get(prominent);
			},

			get dense() {
				return $.get(dense);
			},

			get color() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				Row($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root();
						var node_4 = $.first_child(fragment_5);

						Section(node_4, {
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root();
								var node_5 = $.first_child(fragment_6);

								IconButton(node_5, {
									children: ($$anchor, $$slotProps) => {
										Icon($$anchor, {
											class: 'material-icons',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('menu');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								var node_6 = $.sibling(node_5, 2);

								Title(node_6, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Flex Static');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});

						var node_7 = $.sibling(node_4, 2);

						Section(node_7, {
							align: 'end',
							toolbar: true,
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = root_1();
								var node_8 = $.first_child(fragment_8);

								IconButton(node_8, {
									'aria-label': 'Download',
									children: ($$anchor, $$slotProps) => {
										Icon($$anchor, {
											class: 'material-icons',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('file_download');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								var node_9 = $.sibling(node_8, 2);

								IconButton(node_9, {
									'aria-label': 'Print this page',
									children: ($$anchor, $$slotProps) => {
										Icon($$anchor, {
											class: 'material-icons',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('print');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								var node_10 = $.sibling(node_9, 2);

								IconButton(node_10, {
									'aria-label': 'Bookmark this page',
									children: ($$anchor, $$slotProps) => {
										Icon($$anchor, {
											class: 'material-icons',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('bookmark');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	var div_3 = $.sibling(node_3, 2);
	var node_11 = $.child(div_3);

	LoremIpsum(node_11, {});
	$.next(2);
	$.reset(div_3);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_12 = $.child(div_4);

	{
		let $0 = $.derived(() => $.get(secondaryColor) ? 'secondary' : 'primary');

		TopAppBar(node_12, {
			variant: 'static',
			get prominent() {
				return $.get(prominent);
			},

			get dense() {
				return $.get(dense);
			},

			get color() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				Row($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_13 = root();
						var node_13 = $.first_child(fragment_13);

						Section(node_13, {
							children: ($$anchor, $$slotProps) => {
								var fragment_14 = root();
								var node_14 = $.first_child(fragment_14);

								IconButton(node_14, {
									children: ($$anchor, $$slotProps) => {
										Icon($$anchor, {
											class: 'material-icons',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('menu');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								var node_15 = $.sibling(node_14, 2);

								Title(node_15, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_9 = $.text('Static');

										$.append($$anchor, text_9);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_14);
							},
							$$slots: { default: true }
						});

						var node_16 = $.sibling(node_13, 2);

						Section(node_16, {
							align: 'end',
							toolbar: true,
							children: ($$anchor, $$slotProps) => {
								var fragment_16 = root_1();
								var node_17 = $.first_child(fragment_16);

								IconButton(node_17, {
									'aria-label': 'Download',
									children: ($$anchor, $$slotProps) => {
										Icon($$anchor, {
											class: 'material-icons',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('file_download');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								var node_18 = $.sibling(node_17, 2);

								IconButton(node_18, {
									'aria-label': 'Print this page',
									children: ($$anchor, $$slotProps) => {
										Icon($$anchor, {
											class: 'material-icons',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_11 = $.text('print');

												$.append($$anchor, text_11);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								var node_19 = $.sibling(node_18, 2);

								IconButton(node_19, {
									'aria-label': 'Bookmark this page',
									children: ($$anchor, $$slotProps) => {
										Icon($$anchor, {
											class: 'material-icons',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_12 = $.text('bookmark');

												$.append($$anchor, text_12);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_16);
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
	}

	var div_5 = $.sibling(node_12, 2);
	var node_20 = $.child(div_5);

	LoremIpsum(node_20, {});
	$.next(2);
	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_1);
	$.append($$anchor, fragment);
}