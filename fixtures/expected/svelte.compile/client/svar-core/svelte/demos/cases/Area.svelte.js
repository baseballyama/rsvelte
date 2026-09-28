import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Area, Field } from "../../src/index";

var root = $.from_html(`<div class="demo-box"><h3>Area with a top label</h3> <!> <!> <!> <!></div> <div class="demo-box"><h3>Area with a side label</h3> <!></div>`, 1);

export default function Area_1($$anchor) {
	let v1;
	let v2;
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	Field(node, {
		label: 'Details',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Area($$anchor, {
					get id() {
						return $.get(id);
					},
					placeholder: 'Type here',
					get value() {
						return v1;
					},

					set value($$value) {
						v1 = $$value;
					}
				});
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Disabled',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Area($$anchor, {
					get id() {
						return $.get(id);
					},
					disabled: true,
					placeholder: 'Type here',
					get value() {
						return v1;
					},

					set value($$value) {
						v1 = $$value;
					}
				});
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Field(node_2, {
		label: 'Readonly',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Area($$anchor, {
					get id() {
						return $.get(id);
					},
					readonly: true,
					placeholder: 'Type here',
					get value() {
						return v1;
					},

					set value($$value) {
						v1 = $$value;
					}
				});
			}
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Field(node_3, {
		label: 'Error',
		error: true,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Area($$anchor, {
					get id() {
						return $.get(id);
					},
					error: true,
					placeholder: 'Type here',
					title: 'It can\'t be empty',
					get value() {
						return v1;
					},

					set value($$value) {
						v1 = $$value;
					}
				});
			}
		}
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_4 = $.sibling($.child(div_1), 2);

	Field(node_4, {
		label: 'Details',
		position: 'left',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Area($$anchor, {
					get id() {
						return $.get(id);
					},
					placeholder: 'Type here',
					get value() {
						return v2;
					},

					set value($$value) {
						v2 = $$value;
					}
				});
			}
		}
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}