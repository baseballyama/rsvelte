import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, RangeField, Switch } from 'svelte-ux';
import PathDataMenuField from '$lib/components/controls/fields/PathDataMenuField.svelte';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

var root = $.from_html(`<div class="grid grid-cols-[100px_auto_1fr] gap-2"><!> <!></div>`);
var root_1 = $.from_html(`<div class="grid gap-2 mb-4 screenshot-hidden"><div class="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2"><!> <!> <!> <!> <!></div> <!></div>`);

export default function AreaPlaygroundControls($$anchor, $$props) {
	$.push($$props, true);

	let config = $.prop($$props, 'config', 31, () => $.proxy({
			pathGenerator: (x) => x,
			curve: undefined,
			pointCount: 10,
			showPoints: false,
			showLine: true,
			show: true,
			tweened: true
		})),
		includeShowTween = $.prop($$props, 'includeShowTween', 3, true);

	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	PathDataMenuField(node, {
		get value() {
			return config().pathGenerator;
		},

		set value($$value) {
			config(config().pathGenerator = $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	CurveMenuField(node_1, {
		get value() {
			return config().curve;
		},

		set value($$value) {
			config(config().curve = $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	RangeField(node_2, {
		label: 'Points',
		min: 2,
		get value() {
			return config().pointCount;
		},

		set value($$value) {
			config(config().pointCount = $$value, true);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Field(node_3, {
		label: 'Show points',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Switch($$anchor, {
					get id() {
						return $.get(id);
					},
					size: 'md',
					get checked() {
						return config().showPoints;
					},

					set checked($$value) {
						config(config().showPoints = $$value, true);
					}
				});
			}
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Field(node_4, {
		label: 'Show Line',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Switch($$anchor, {
					get id() {
						return $.get(id);
					},
					size: 'md',
					get checked() {
						return config().showLine;
					},

					set checked($$value) {
						config(config().showLine = $$value, true);
					}
				});
			}
		}
	});

	$.reset(div_1);

	var node_5 = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			var node_6 = $.child(div_2);

			Field(node_6, {
				label: 'Show',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const id = $.derived(() => $$slotProps.id);

						Switch($$anchor, {
							get id() {
								return $.get(id);
							},
							size: 'md',
							get checked() {
								return config().show;
							},

							set checked($$value) {
								config(config().show = $$value, true);
							}
						});
					}
				}
			});

			var node_7 = $.sibling(node_6, 2);

			Field(node_7, {
				label: 'Tweened',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const id = $.derived(() => $$slotProps.id);

						Switch($$anchor, {
							get id() {
								return $.get(id);
							},
							size: 'md',
							get checked() {
								return config().tweened;
							},

							set checked($$value) {
								config(config().tweened = $$value, true);
							}
						});
					}
				}
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_5, ($$render) => {
			if (includeShowTween()) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}