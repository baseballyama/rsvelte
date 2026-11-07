import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Field, ProgressCircle, RangeField } from 'svelte-ux';

var root = $.from_html(`<div class="grid gap-1 mb-4 screenshot-hidden"><div class="grid grid-cols-7 gap-2"><!> <!> <!> <!> <!></div> <div class="grid grid-cols-4 gap-2"><!> <!> <!> <!></div> <div class="grid grid-cols-7 gap-2"><!> <!> <!> <!></div> <div class="grid grid-cols-7 gap-2"><!> <!> <!> <!></div> <div class="grid grid-cols-7 gap-2"><!> <!> <!></div></div>`);

export default function ForceGraphPlaygroundControls($$anchor, $$props) {
	$.push($$props, true);

	let config = $.prop($$props, 'config', 31, () => $.proxy({
		isStatic: false,
		isStopped: false,
		alphaTarget: 0,
		alpha: 1,
		running: false,
		nodeRadius: 3,
		nodeStrokeWidth: 0,
		linkWidth: 1,
		linkOpacity: 0.5,
		hasLinkForce: true,
		linkDistance: 30,
		hasCenterForce: true,
		centerStrength: 1.0,
		hasChargeForce: true,
		chargeDistanceMin: 1,
		chargeDistanceMax: 1000,
		chargeStrength: -30,
		hasCollideForce: true,
		collideRadius: 3,
		collideStrength: 1
	}));

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Field(node, {
		label: 'Type',
		class: 'col-span-1',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				size: 'xs',
				get checked() {
					return config().isStatic;
				},

				set checked($$value) {
					config(config().isStatic = $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Static');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'State',
		class: 'col-span-1',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				size: 'xs',
				get checked() {
					return config().isStopped;
				},

				set checked($$value) {
					config(config().isStopped = $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Stopped');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	RangeField(node_2, {
		label: 'Alpha Target',
		class: 'col-span-2',
		min: 0,
		max: 1,
		step: 0.1,
		get value() {
			return config().alphaTarget;
		},

		set value($$value) {
			config(config().alphaTarget = $$value, true);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	RangeField(node_3, {
		label: 'Alpha',
		class: 'col-span-2',
		min: 0,
		max: 1,
		step: 0.001,
		format: 'decimal',
		get value() {
			return config().alpha;
		},

		set value($$value) {
			config(config().alpha = $$value, true);
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Field(node_4, {
		label: 'Running',
		class: 'col-span-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_5 = $.first_child(fragment_2);

			{
				var consequent = ($$anchor) => {
					ProgressCircle($$anchor, { size: 15 });
				};

				$.if(node_5, ($$render) => {
					if (config().running) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_6 = $.child(div_2);

	RangeField(node_6, {
		label: 'Node Radius',
		class: 'col-span-1',
		min: 3,
		max: 30,
		step: 1,
		get value() {
			return config().nodeRadius;
		},

		set value($$value) {
			config(config().nodeRadius = $$value, true);
		}
	});

	var node_7 = $.sibling(node_6, 2);

	RangeField(node_7, {
		label: 'Node Stroke Width',
		class: 'col-span-1',
		min: 0,
		max: 10,
		step: 0.5,
		get value() {
			return config().nodeStrokeWidth;
		},

		set value($$value) {
			config(config().nodeStrokeWidth = $$value, true);
		}
	});

	var node_8 = $.sibling(node_7, 2);

	RangeField(node_8, {
		label: 'Link Width',
		class: 'col-span-1',
		min: 1,
		max: 10,
		step: 0.5,
		get value() {
			return config().linkWidth;
		},

		set value($$value) {
			config(config().linkWidth = $$value, true);
		}
	});

	var node_9 = $.sibling(node_8, 2);

	RangeField(node_9, {
		label: 'Link Opacity',
		class: 'col-span-1',
		min: 0.1,
		max: 1,
		step: 0.1,
		get value() {
			return config().linkOpacity;
		},

		set value($$value) {
			config(config().linkOpacity = $$value, true);
		}
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_10 = $.child(div_3);

	Field(node_10, {
		label: 'Link Force',
		class: 'col-span-1',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				size: 'xs',
				get checked() {
					return config().hasLinkForce;
				},

				set checked($$value) {
					config(config().hasLinkForce = $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	{
		let $0 = $.derived(() => !config().hasLinkForce);

		RangeField(node_11, {
			label: 'Link Distance',
			class: 'col-span-3',
			min: 0,
			max: 100,
			step: 1,
			get disabled() {
				return $.get($0);
			},

			get value() {
				return config().linkDistance;
			},

			set value($$value) {
				config(config().linkDistance = $$value, true);
			}
		});
	}

	var node_12 = $.sibling(node_11, 2);

	Field(node_12, {
		label: 'Center Force',
		class: 'col-span-1',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				size: 'xs',
				get checked() {
					return config().hasCenterForce;
				},

				set checked($$value) {
					config(config().hasCenterForce = $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	RangeField(node_13, {
		label: 'Center Strength',
		class: 'col-span-2',
		min: 0,
		max: 1,
		step: 0.1,
		get value() {
			return config().centerStrength;
		},

		set value($$value) {
			config(config().centerStrength = $$value, true);
		}
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_14 = $.child(div_4);

	Field(node_14, {
		label: 'Charge Force',
		class: 'col-span-1',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				size: 'xs',
				get checked() {
					return config().hasChargeForce;
				},

				set checked($$value) {
					config(config().hasChargeForce = $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 2);

	{
		let $0 = $.derived(() => !config().hasChargeForce);

		RangeField(node_15, {
			label: 'Charge Distance Min',
			class: 'col-span-2',
			min: 1,
			max: 10,
			step: 1,
			get disabled() {
				return $.get($0);
			},

			get value() {
				return config().chargeDistanceMin;
			},

			set value($$value) {
				config(config().chargeDistanceMin = $$value, true);
			}
		});
	}

	var node_16 = $.sibling(node_15, 2);

	{
		let $0 = $.derived(() => !config().hasChargeForce);

		RangeField(node_16, {
			label: 'Charge Distance Max',
			class: 'col-span-2',
			min: 1,
			max: 1000,
			step: 10,
			get disabled() {
				return $.get($0);
			},

			get value() {
				return config().chargeDistanceMax;
			},

			set value($$value) {
				config(config().chargeDistanceMax = $$value, true);
			}
		});
	}

	var node_17 = $.sibling(node_16, 2);

	{
		let $0 = $.derived(() => !config().hasChargeForce);

		RangeField(node_17, {
			label: 'Charge Strength',
			class: 'col-span-2',
			min: -100,
			max: 10,
			step: 1,
			get disabled() {
				return $.get($0);
			},

			get value() {
				return config().chargeStrength;
			},

			set value($$value) {
				config(config().chargeStrength = $$value, true);
			}
		});
	}

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_18 = $.child(div_5);

	Field(node_18, {
		label: 'Collide Force',
		class: 'col-span-1',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				size: 'xs',
				get checked() {
					return config().hasCollideForce;
				},

				set checked($$value) {
					config(config().hasCollideForce = $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_18, 2);

	RangeField(node_19, {
		label: 'Collide Radius',
		class: 'col-span-3',
		min: 0,
		max: 30,
		step: 1,
		get value() {
			return config().collideRadius;
		},

		set value($$value) {
			config(config().collideRadius = $$value, true);
		}
	});

	var node_20 = $.sibling(node_19, 2);

	RangeField(node_20, {
		label: 'Collide Strength',
		class: 'col-span-3',
		min: 0,
		max: 1,
		step: 0.1,
		get value() {
			return config().collideStrength;
		},

		set value($$value) {
			config(config().collideStrength = $$value, true);
		}
	});

	$.reset(div_5);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}