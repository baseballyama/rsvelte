import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ProgressCircle, Overlay, Toggle } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="relative"><!> <div>Some content</div> <div>Some content</div> <div>Some content</div> <div>Some content</div></div>`);
var root_1 = $.from_html(`<div class="relative"><!> <div>Some content</div> <div>Some content</div> <div>Some content</div> <div>Some content</div> <!></div>`);
var root_2 = $.from_html(`<h1>Examples</h1> <h2>Loading overlay</h2> <!> <h2>Change color</h2> <!> <h2>Prompt</h2> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root_2();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node_1 = $.child(div);

			Overlay(node_1, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					ProgressCircle($$anchor, {});
				},
				$$slots: { default: true }
			});

			$.next(8);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			var div_1 = root();
			var node_3 = $.child(div_1);

			Overlay(node_3, {
				center: true,
				class: 'bg-surface-content/10',
				children: ($$anchor, $$slotProps) => {
					ProgressCircle($$anchor, {});
				},
				$$slots: { default: true }
			});

			$.next(8);
			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const show = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						var div_2 = root_1();
						var node_5 = $.child(div_2);

						{
							var consequent = ($$anchor) => {
								Overlay($$anchor, {
									center: true,
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											class: 'border',
											$$events: {
												click: function (...$$args) {
													$.get(toggle)?.apply(this, $$args);
												}
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Close Overlay');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							};

							$.if(node_5, ($$render) => {
								if ($.get(show)) $$render(consequent);
							});
						}

						var node_6 = $.sibling(node_5, 10);

						Button(node_6, {
							class: 'border mt-4',
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Show Overlay');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						$.reset(div_2);
						$.append($$anchor, div_2);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}