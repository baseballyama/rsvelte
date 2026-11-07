import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Drawer, { AppContent, Content, Header, Title, Subtitle } from '@smui/drawer';
import Button, { Label } from '@smui/button';
import List, { Item, Text } from '@smui/list';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<main class="main-content svelte-skdyr"><!> <br class="svelte-skdyr"/> <pre class="status svelte-skdyr"> </pre></main>`);
var root_3 = $.from_html(`<div class="drawer-container svelte-skdyr"><!> <!></div>`);

export default function _Dismissible($$anchor) {
	let open = $.state(false);
	let active = $.state('Gray Kittens');

	function setActive(value) {
		$.set(active, value, true);
	}

	var div = root_3();
	var node = $.child(div);

	Drawer(node, {
		variant: 'dismissible',
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

							var text = $.text('Super Drawer');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Subtitle(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('It\'s the best drawer.');

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
								let $0 = $.derived(() => $.get(active) === 'Gray Kittens');

								Item(node_5, {
									href: 'javascript:void(0)',
									onclick: () => setActive('Gray Kittens'),
									get activated() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										Text($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Gray Kittens');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							}

							var node_6 = $.sibling(node_5, 2);

							{
								let $0 = $.derived(() => $.get(active) === 'A Space Rocket');

								Item(node_6, {
									href: 'javascript:void(0)',
									onclick: () => setActive('A Space Rocket'),
									get activated() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										Text($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('A Space Rocket');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							}

							var node_7 = $.sibling(node_6, 2);

							{
								let $0 = $.derived(() => $.get(active) === '100 Pounds of Gravel');

								Item(node_7, {
									href: 'javascript:void(0)',
									onclick: () => setActive('100 Pounds of Gravel'),
									get activated() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										Text($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('100 Pounds of Gravel');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							}

							var node_8 = $.sibling(node_7, 2);

							{
								let $0 = $.derived(() => $.get(active) === 'All of the Shrimp');

								Item(node_8, {
									href: 'javascript:void(0)',
									onclick: () => setActive('All of the Shrimp'),
									get activated() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										Text($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('All of the Shrimp');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							}

							var node_9 = $.sibling(node_8, 2);

							{
								let $0 = $.derived(() => $.get(active) === 'A Planet with a Mall');

								Item(node_9, {
									href: 'javascript:void(0)',
									onclick: () => setActive('A Planet with a Mall'),
									get activated() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										Text($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('A Planet with a Mall');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
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

	var node_10 = $.sibling(node, 2);

	AppContent(node_10, {
		class: 'app-content',
		children: ($$anchor, $$slotProps) => {
			var main = root_2();
			var node_11 = $.child(main);

			Button(node_11, {
				onclick: () => $.set(open, !$.get(open)),
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Toggle Drawer');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var pre = $.sibling(node_11, 4);
			var text_8 = $.only_child(pre);

			$.reset(main);
			$.template_effect(() => $.set_text(text_8, `Active: ${$.get(active) ?? ''}`));
			$.append($$anchor, main);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}