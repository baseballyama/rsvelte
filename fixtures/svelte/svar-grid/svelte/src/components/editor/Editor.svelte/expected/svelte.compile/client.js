import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Field,
	Text,
	RichSelect,
	MultiCombo,
	DatePicker,
	Area,
	Checkbox,
	Switch
} from "@svar-ui/svelte-core";

export default function Editor($$anchor, $$props) {
	$.push($$props, true);

	const $data = () => $.store_get(data(), '$data', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let data = $.prop($$props, 'data', 3, null);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_6 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => $$props.editors, $.index, ($$anchor, editor) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				{
					var consequent = ($$anchor) => {
						Field($$anchor, {
							get label() {
								return $.get(editor).label;
							},

							children: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => $.get(editor).options || []);

									RichSelect($$anchor, {
										get options() {
											return $.get($0);
										},

										get value() {
											return $data()[$.get(editor).id];
										},

										set value($$value) {
											$.store_mutate(data(), $.untrack($data)[$.get(editor).id] = $$value, $.untrack($data));
										}
									});
								}
							},
							$$slots: { default: true }
						});
					};

					var consequent_1 = ($$anchor) => {
						Field($$anchor, {
							get label() {
								return $.get(editor).label;
							},

							children: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => $.get(editor).options || []);

									MultiCombo($$anchor, {
										textField: 'name',
										checkboxes: false,
										get options() {
											return $.get($0);
										},

										get value() {
											return $data()[$.get(editor).id];
										},

										set value($$value) {
											$.store_mutate(data(), $.untrack($data)[$.get(editor).id] = $$value, $.untrack($data));
										}
									});
								}
							},
							$$slots: { default: true }
						});
					};

					var consequent_2 = ($$anchor) => {
						Field($$anchor, {
							get label() {
								return $.get(editor).label;
							},

							children: ($$anchor, $$slotProps) => {
								DatePicker($$anchor, {
									get value() {
										return $data()[$.get(editor).id];
									},

									set value($$value) {
										$.store_mutate(data(), $.untrack($data)[$.get(editor).id] = $$value, $.untrack($data));
									}
								});
							},
							$$slots: { default: true }
						});
					};

					var consequent_3 = ($$anchor) => {
						Field($$anchor, {
							get label() {
								return $.get(editor).label;
							},

							children: ($$anchor, $$slotProps) => {
								Area($$anchor, {
									get value() {
										return $data()[$.get(editor).id];
									},

									set value($$value) {
										$.store_mutate(data(), $.untrack($data)[$.get(editor).id] = $$value, $.untrack($data));
									}
								});
							},
							$$slots: { default: true }
						});
					};

					var consequent_4 = ($$anchor) => {
						Field($$anchor, {
							get label() {
								return $.get(editor).label;
							},

							children: ($$anchor, $$slotProps) => {
								Switch($$anchor, {
									get value() {
										return $data()[$.get(editor).id];
									},

									set value($$value) {
										$.store_mutate(data(), $.untrack($data)[$.get(editor).id] = $$value, $.untrack($data));
									}
								});
							},
							$$slots: { default: true }
						});
					};

					var consequent_5 = ($$anchor) => {
						Field($$anchor, {
							get label() {
								return $.get(editor).label;
							},

							children: ($$anchor, $$slotProps) => {
								Checkbox($$anchor, {
									get value() {
										return $data()[$.get(editor).id];
									},

									set value($$value) {
										$.store_mutate(data(), $.untrack($data)[$.get(editor).id] = $$value, $.untrack($data));
									}
								});
							},
							$$slots: { default: true }
						});
					};

					var alternate = ($$anchor) => {
						Field($$anchor, {
							get label() {
								return $.get(editor).label;
							},

							children: ($$anchor, $$slotProps) => {
								Text($$anchor, {
									get value() {
										return $data()[$.get(editor).id];
									},

									set value($$value) {
										$.store_mutate(data(), $.untrack($data)[$.get(editor).id] = $$value, $.untrack($data));
									}
								});
							},
							$$slots: { default: true }
						});
					};

					$.if(node_2, ($$render) => {
						if ($.get(editor).type === "combo") $$render(consequent); else if ($.get(editor).type === "multicombo") $$render(consequent_1, 1); else if ($.get(editor).type === "datepicker") $$render(consequent_2, 2); else if ($.get(editor).type === "textarea") $$render(consequent_3, 3); else if ($.get(editor).type === "switch") $$render(consequent_4, 4); else if ($.get(editor).type === "checkbox") $$render(consequent_5, 5); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (data()) $$render(consequent_6);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}