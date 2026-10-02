import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Column, Content, Grid, Link, Row } from "carbon-components-svelte";

var root = $.from_html(`<h1>404</h1> <div>Page not found. <!></div>`, 1);

export default function ____404_($$anchor) {
	$.head('10pcq2c', ($$anchor) => {
		$.effect(() => {
			$.document.title = '404';
		});
	});

	Content($$anchor, {
		style: 'min-height: calc(100vh - 6rem - 1px);',
		children: ($$anchor, $$slotProps) => {
			Grid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Row($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Column($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var div = $.sibling($.first_child(fragment_4), 2);
									var node = $.sibling($.child(div));

									Link(node, {
										href: '/',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Return home');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									$.reset(div);
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}