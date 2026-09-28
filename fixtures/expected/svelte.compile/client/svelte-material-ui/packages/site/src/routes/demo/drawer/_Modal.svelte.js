import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Drawer, { AppContent, Content, Header, Title, Subtitle, Scrim } from '@smui/drawer';
import Button, { Label } from '@smui/button';
import List, { Item, Text, Graphic, Separator, Subheader } from '@smui/list';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<main class="main-content svelte-12ouzm0"><!> <br class="svelte-12ouzm0"/> <pre class="status svelte-12ouzm0"> </pre> <div style="height: 700px;" class="svelte-12ouzm0">&nbsp;</div> And some stuff at the bottom.</main>`);
var root_3 = $.from_html(`<div class="drawer-container svelte-12ouzm0"><!> <!> <!></div>`);

export default function _Modal($$anchor) {
	let open = $.state(false);
	let active = $.state('Inbox');

	function setActive(value) {
		$.set(active, value, true);
		$.set(open, false);
	}

	var div = root_3();
	var node = $.child(div);

	Drawer(node, {
		variant: 'modal',
		fixed: false,
		get open() {
			return $.get(open);
		},

		set open($$value) {
			$.set(open, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Header(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					Title(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Super Mail');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Subtitle(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('It\'s the best fake mail app drawer.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			Content(node_4, {
				children: ($$anchor, $$slotProps) => {
					List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_5 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => $.get(active) === 'Inbox');

								Item(node_5, {
									href: 'javascript:void(0)',
									onclick: () => setActive('Inbox'),
									get activated() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_6 = $.first_child(fragment_4);

										Graphic(node_6, {
											class: 'material-icons',
											'aria-hidden': 'true',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('inbox');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});

										var node_7 = $.sibling(node_6, 2);

										Text(node_7, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Inbox');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							}

							var node_8 = $.sibling(node_5, 2);

							{
								let $0 = $.derived(() => $.get(active) === 'Star');

								Item(node_8, {
									href: 'javascript:void(0)',
									onclick: () => setActive('Star'),
									get activated() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();
										var node_9 = $.first_child(fragment_5);

										Graphic(node_9, {
											class: 'material-icons',
											'aria-hidden': 'true',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('star');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});

										var node_10 = $.sibling(node_9, 2);

										Text(node_10, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Star');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							}

							var node_11 = $.sibling(node_8, 2);

							{
								let $0 = $.derived(() => $.get(active) === 'Sent Mail');

								Item(node_11, {
									href: 'javascript:void(0)',
									onclick: () => setActive('Sent Mail'),
									get activated() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_12 = $.first_child(fragment_6);

										Graphic(node_12, {
											class: 'material-icons',
											'aria-hidden': 'true',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('send');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});

										var node_13 = $.sibling(node_12, 2);

										Text(node_13, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('Sent Mail');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							}

							var node_14 = $.sibling(node_11, 2);

							{
								let $0 = $.derived(() => $.get(active) === 'Drafts');

								Item(node_14, {
									href: 'javascript:void(0)',
									onclick: () => setActive('Drafts'),
									get activated() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root();
										var node_15 = $.first_child(fragment_7);

										Graphic(node_15, {
											class: 'material-icons',
											'aria-hidden': 'true',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('drafts');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});

										var node_16 = $.sibling(node_15, 2);

										Text(node_16, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('Drafts');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							}

							var node_17 = $.sibling(node_14, 2);

							Separator(node_17, {});

							var node_18 = $.sibling(node_17, 2);

							Subheader(node_18, {
								tag: 'h6',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Labels');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});

							var node_19 = $.sibling(node_18, 2);

							{
								let $0 = $.derived(() => $.get(active) === 'Family');

								Item(node_19, {
									href: 'javascript:void(0)',
									onclick: () => setActive('Family'),
									get activated() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root();
										var node_20 = $.first_child(fragment_8);

										Graphic(node_20, {
											class: 'material-icons',
											'aria-hidden': 'true',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_11 = $.text('bookmark');

												$.append($$anchor, text_11);
											},
											$$slots: { default: true }
										});

										var node_21 = $.sibling(node_20, 2);

										Text(node_21, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_12 = $.text('Family');

												$.append($$anchor, text_12);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							}

							var node_22 = $.sibling(node_19, 2);

							{
								let $0 = $.derived(() => $.get(active) === 'Friends');

								Item(node_22, {
									href: 'javascript:void(0)',
									onclick: () => setActive('Friends'),
									get activated() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root();
										var node_23 = $.first_child(fragment_9);

										Graphic(node_23, {
											class: 'material-icons',
											'aria-hidden': 'true',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_13 = $.text('bookmark');

												$.append($$anchor, text_13);
											},
											$$slots: { default: true }
										});

										var node_24 = $.sibling(node_23, 2);

										Text(node_24, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_14 = $.text('Friends');

												$.append($$anchor, text_14);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							}

							var node_25 = $.sibling(node_22, 2);

							{
								let $0 = $.derived(() => $.get(active) === 'Work');

								Item(node_25, {
									href: 'javascript:void(0)',
									onclick: () => setActive('Work'),
									get activated() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_10 = root();
										var node_26 = $.first_child(fragment_10);

										Graphic(node_26, {
											class: 'material-icons',
											'aria-hidden': 'true',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_15 = $.text('bookmark');

												$.append($$anchor, text_15);
											},
											$$slots: { default: true }
										});

										var node_27 = $.sibling(node_26, 2);

										Text(node_27, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_16 = $.text('Work');

												$.append($$anchor, text_16);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_10);
									},
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_28 = $.sibling(node, 2);

	Scrim(node_28, { fixed: false });

	var node_29 = $.sibling(node_28, 2);

	AppContent(node_29, {
		class: 'app-content',
		children: ($$anchor, $$slotProps) => {
			var main = root_2();
			var node_30 = $.child(main);

			Button(node_30, {
				onclick: () => $.set(open, !$.get(open)),
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_17 = $.text('Toggle Drawer');

							$.append($$anchor, text_17);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var pre = $.sibling(node_30, 4);
			var text_18 = $.only_child(pre);

			$.next(3);
			$.reset(main);
			$.template_effect(() => $.set_text(text_18, `Active: ${$.get(active) ?? ''}`));
			$.append($$anchor, main);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}