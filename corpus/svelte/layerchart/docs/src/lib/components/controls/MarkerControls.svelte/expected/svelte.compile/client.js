import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, RangeField, Switch } from 'svelte-ux';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import PathDataMenuField from '$lib/components/controls/fields/PathDataMenuField.svelte';
import ShowField from './fields/ShowField.svelte';

var root = $.from_html(`<div class="grid grid-cols-[auto_auto_auto_auto_auto_1fr_1fr_1fr] gap-2 mb-2 screenshot-hidden"><!> <!> <!> <!> <!> <!> <!> <!></div>`);

export default function MarkerControls($$anchor, $$props) {
	$.push($$props, true);

	let config = $.prop($$props, 'config', 31, () => $.proxy({
		show: false,
		tweened: true,
		markerStart: undefined,
		markerMid: undefined,
		markerEnd: undefined,
		pathGenerator: (x) => x,
		curve: undefined,
		pointCount: 10,
		amplitude: 1,
		frequency: 10,
		phase: 0
	}));

	var div = root();
	var node = $.child(div);

	ShowField(node, {
		inline: true,
		get show() {
			return config().show;
		},

		set show($$value) {
			config(config().show = $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Tween',
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

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			Field($$anchor, {
				label: 'Start',
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
								return config().markerStart;
							},

							set checked($$value) {
								config(config().markerStart = $$value, true);
							}
						});
					}
				}
			});
		};

		$.if(node_2, ($$render) => {
			if (config().markerStart !== undefined) $$render(consequent);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			Field($$anchor, {
				label: 'Mid',
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
								return config().markerMid;
							},

							set checked($$value) {
								config(config().markerMid = $$value, true);
							}
						});
					}
				}
			});
		};

		$.if(node_3, ($$render) => {
			if (config().markerMid !== undefined) $$render(consequent_1);
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent_2 = ($$anchor) => {
			Field($$anchor, {
				label: 'End',
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
								return config().markerEnd;
							},

							set checked($$value) {
								config(config().markerEnd = $$value, true);
							}
						});
					}
				}
			});
		};

		$.if(node_4, ($$render) => {
			if (config().markerEnd !== undefined) $$render(consequent_2);
		});
	}

	var node_5 = $.sibling(node_4, 2);

	RangeField(node_5, {
		label: 'Points',
		min: 2,
		get value() {
			return config().pointCount;
		},

		set value($$value) {
			config(config().pointCount = $$value, true);
		}
	});

	var node_6 = $.sibling(node_5, 2);

	PathDataMenuField(node_6, {
		get amplitude() {
			return config().amplitude;
		},

		get frequency() {
			return config().frequency;
		},

		get phase() {
			return config().phase;
		},

		get value() {
			return config().pathGenerator;
		},

		set value($$value) {
			config(config().pathGenerator = $$value, true);
		}
	});

	var node_7 = $.sibling(node_6, 2);

	CurveMenuField(node_7, {
		get value() {
			return config().curve;
		},

		set value($$value) {
			config(config().curve = $$value, true);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}