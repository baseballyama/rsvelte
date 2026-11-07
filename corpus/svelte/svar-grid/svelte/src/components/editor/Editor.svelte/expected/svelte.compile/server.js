import * as $ from 'svelte/internal/server';

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

export default function Editor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { editors, data = null } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (data) {
				$$renderer.push(`<!--[0--><!--[-->`);

				const each_array = $.ensure_array_like(editors);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let editor = each_array[$$index];

					if (editor.type === "combo") {
						$$renderer.push('<!--[0-->');

						Field($$renderer, {
							label: editor.label,
							children: ($$renderer) => {
								RichSelect($$renderer, {
									options: editor.options || [],
									get value() {
										return $.store_get($$store_subs ??= {}, '$data', data)[editor.id];
									},

									set value($$value) {
										$.store_mutate($$store_subs ??= {}, '$data', data, $.store_get($$store_subs ??= {}, '$data', data)[editor.id] = $$value);
										$$settled = false;
									}
								});
							},
							$$slots: { default: true }
						});
					} else if (editor.type === "multicombo") {
						$$renderer.push('<!--[1-->');

						Field($$renderer, {
							label: editor.label,
							children: ($$renderer) => {
								MultiCombo($$renderer, {
									textField: 'name',
									checkboxes: false,
									options: editor.options || [],
									get value() {
										return $.store_get($$store_subs ??= {}, '$data', data)[editor.id];
									},

									set value($$value) {
										$.store_mutate($$store_subs ??= {}, '$data', data, $.store_get($$store_subs ??= {}, '$data', data)[editor.id] = $$value);
										$$settled = false;
									}
								});
							},
							$$slots: { default: true }
						});
					} else if (editor.type === "datepicker") {
						$$renderer.push('<!--[2-->');

						Field($$renderer, {
							label: editor.label,
							children: ($$renderer) => {
								DatePicker($$renderer, {
									get value() {
										return $.store_get($$store_subs ??= {}, '$data', data)[editor.id];
									},

									set value($$value) {
										$.store_mutate($$store_subs ??= {}, '$data', data, $.store_get($$store_subs ??= {}, '$data', data)[editor.id] = $$value);
										$$settled = false;
									}
								});
							},
							$$slots: { default: true }
						});
					} else if (editor.type === "textarea") {
						$$renderer.push('<!--[3-->');

						Field($$renderer, {
							label: editor.label,
							children: ($$renderer) => {
								Area($$renderer, {
									get value() {
										return $.store_get($$store_subs ??= {}, '$data', data)[editor.id];
									},

									set value($$value) {
										$.store_mutate($$store_subs ??= {}, '$data', data, $.store_get($$store_subs ??= {}, '$data', data)[editor.id] = $$value);
										$$settled = false;
									}
								});
							},
							$$slots: { default: true }
						});
					} else if (editor.type === "switch") {
						$$renderer.push('<!--[4-->');

						Field($$renderer, {
							label: editor.label,
							children: ($$renderer) => {
								Switch($$renderer, {
									get value() {
										return $.store_get($$store_subs ??= {}, '$data', data)[editor.id];
									},

									set value($$value) {
										$.store_mutate($$store_subs ??= {}, '$data', data, $.store_get($$store_subs ??= {}, '$data', data)[editor.id] = $$value);
										$$settled = false;
									}
								});
							},
							$$slots: { default: true }
						});
					} else if (editor.type === "checkbox") {
						$$renderer.push('<!--[5-->');

						Field($$renderer, {
							label: editor.label,
							children: ($$renderer) => {
								Checkbox($$renderer, {
									get value() {
										return $.store_get($$store_subs ??= {}, '$data', data)[editor.id];
									},

									set value($$value) {
										$.store_mutate($$store_subs ??= {}, '$data', data, $.store_get($$store_subs ??= {}, '$data', data)[editor.id] = $$value);
										$$settled = false;
									}
								});
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');

						Field($$renderer, {
							label: editor.label,
							children: ($$renderer) => {
								Text($$renderer, {
									get value() {
										return $.store_get($$store_subs ??= {}, '$data', data)[editor.id];
									},

									set value($$value) {
										$.store_mutate($$store_subs ??= {}, '$data', data, $.store_get($$store_subs ??= {}, '$data', data)[editor.id] = $$value);
										$$settled = false;
									}
								});
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}