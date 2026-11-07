import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RichSelect, Button, Text, Segmented, Field, DatePicker } from "@svar-ui/svelte-core";
import Lock from "./Lock.svelte";
import { getData } from "../data";

var root = $.from_html(`<i></i>`);
var root_1 = $.from_html(`<span class="icon svelte-1edxl3m"><!></span>`);
var root_2 = $.from_html(`<!> <span class="bottom"> </span>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="column svelte-1edxl3m"><div class="segmented svelte-1edxl3m"><!></div> <div class="form svelte-1edxl3m"><!> <!></div></div>`);

export default function Form($$anchor, $$props) {
	$.push($$props, true);

	const { segmentedOptions, location, positions } = getData();
	let value = $.state(1);
	var div = root_4();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		const children = ($$anchor, $$arg0) => {
			let option = () => ($$arg0?.()).option;
			var fragment = root_2();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var i = root();

					$.template_effect(() => $.set_class(i, 1, `icon ${option().icon ?? ''}`, 'svelte-1edxl3m'));
					$.append($$anchor, i);
				};

				var alternate = ($$anchor) => {
					var span = root_1();
					var node_2 = $.child(span);

					Lock(node_2, {});
					$.reset(span);
					$.append($$anchor, span);
				};

				$.if(node_1, ($$render) => {
					if (option().icon) $$render(consequent); else $$render(alternate, -1);
				});
			}

			var span_1 = $.sibling(node_1, 2);
			var text = $.only_child(span_1, true);

			$.template_effect(() => $.set_text(text, option().name));
			$.append($$anchor, fragment);
		};

		Segmented(node, {
			get options() {
				return segmentedOptions;
			},

			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},
			children,
			$$slots: { default: true }
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_3 = $.child(div_2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = root_3();
			var node_4 = $.first_child(fragment_1);

			{
				const children = ($$anchor, $$arg0) => {
					let id = () => ($$arg0?.()).id;

					Text($$anchor, {
						value: "Bethany",
						get id() {
							return id();
						}
					});
				};

				Field(node_4, {
					label: 'First name',
					position: 'top',
					children,
					$$slots: { default: true }
				});
			}

			var node_5 = $.sibling(node_4, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let id = () => ($$arg0?.()).id;

					Text($$anchor, {
						value: "Williams",
						get id() {
							return id();
						}
					});
				};

				Field(node_5, {
					label: 'Last name',
					position: 'top',
					children,
					$$slots: { default: true }
				});
			}

			var node_6 = $.sibling(node_5, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let id = () => ($$arg0?.()).id;

					DatePicker($$anchor, {
						value: new Date(2005, 9, 10),
						width: '100%',
						get id() {
							return id();
						}
					});
				};

				Field(node_6, { label: 'Birthday', children, $$slots: { default: true } });
			}

			var node_7 = $.sibling(node_6, 2);

			Field(node_7, {
				label: 'Location',
				position: 'top',
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, option = $.noop) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, option().name));
							$.append($$anchor, text_1);
						};

						RichSelect($$anchor, {
							get options() {
								return location;
							},
							value: 1,
							children,
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Field(node_8, {
				label: 'Position',
				position: 'top',
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, option = $.noop) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, option().name));
							$.append($$anchor, text_2);
						};

						RichSelect($$anchor, {
							get options() {
								return positions;
							},
							value: 1,
							children,
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		};

		var alternate_1 = ($$anchor) => {
			var fragment_9 = root_3();
			var node_9 = $.first_child(fragment_9);

			{
				const children = ($$anchor, $$arg0) => {
					let id = () => ($$arg0?.()).id;

					Text($$anchor, {
						value: "williams.b",
						get id() {
							return id();
						}
					});
				};

				Field(node_9, {
					label: 'Username',
					position: 'top',
					children,
					$$slots: { default: true }
				});
			}

			var node_10 = $.sibling(node_9, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let id = () => ($$arg0?.()).id;

					Text($$anchor, {
						value: "978548753974",
						get id() {
							return id();
						}
					});
				};

				Field(node_10, {
					label: 'Phone number',
					position: 'top',
					children,
					$$slots: { default: true }
				});
			}

			var node_11 = $.sibling(node_10, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let id = () => ($$arg0?.()).id;

					Text($$anchor, {
						value: "williams.bethany@mail.com",
						get id() {
							return id();
						}
					});
				};

				Field(node_11, { label: 'Email', children, $$slots: { default: true } });
			}

			var node_12 = $.sibling(node_11, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let id = () => ($$arg0?.()).id;

					Text($$anchor, {
						value: "123456789",
						get id() {
							return id();
						},
						type: "password",
						icon: "wxi-eye",
						css: 'wx-icon-right'
					});
				};

				Field(node_12, {
					label: 'Current password',
					position: 'top',
					children,
					$$slots: { default: true }
				});
			}

			var node_13 = $.sibling(node_12, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let id = () => ($$arg0?.()).id;

					Text($$anchor, {
						value: "987654321",
						get id() {
							return id();
						},
						type: "password",
						icon: "wxi-eye",
						css: 'wx-icon-right'
					});
				};

				Field(node_13, {
					label: 'New password',
					position: 'top',
					children,
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_9);
		};

		$.if(node_3, ($$render) => {
			if ($.get(value) === 1) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	var node_14 = $.sibling(node_3, 2);

	Button(node_14, { type: "primary", text: "Save" });
	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}