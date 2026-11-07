import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SpeedDial, SpeedDialTrigger, SpeedDialButton } from "flowbite-svelte";
import { ShareNodesSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<div class="grid w-fit grid-cols-8 gap-x-6 gap-y-18"><!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div>`);

export default function Colors($$anchor) {
	var div = root();
	var node = $.child(div);

	SpeedDialTrigger(node, { color: 'red' });

	var node_1 = $.sibling(node, 2);

	SpeedDial(node_1, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	SpeedDialTrigger(node_2, { color: 'purple' });

	var node_3 = $.sibling(node_2, 2);

	SpeedDial(node_3, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	SpeedDialTrigger(node_4, { color: 'light' });

	var node_5 = $.sibling(node_4, 2);

	SpeedDial(node_5, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	SpeedDialTrigger(node_6, { color: 'dark' });

	var node_7 = $.sibling(node_6, 2);

	SpeedDial(node_7, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	SpeedDialTrigger(node_8, { color: 'red' });

	var node_9 = $.sibling(node_8, 2);

	SpeedDial(node_9, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	SpeedDialTrigger(node_10, { color: 'green' });

	var node_11 = $.sibling(node_10, 2);

	SpeedDial(node_11, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 2);

	SpeedDialTrigger(node_12, { color: 'yellow' });

	var node_13 = $.sibling(node_12, 2);

	SpeedDial(node_13, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 2);

	SpeedDialTrigger(node_14, { color: 'blue' });

	var node_15 = $.sibling(node_14, 2);

	SpeedDial(node_15, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_15, 2);

	SpeedDialTrigger(node_16, { color: 'purpleToBlue', gradient: true });

	var node_17 = $.sibling(node_16, 2);

	SpeedDial(node_17, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_17, 2);

	SpeedDialTrigger(node_18, { color: 'cyanToBlue', gradient: true });

	var node_19 = $.sibling(node_18, 2);

	SpeedDial(node_19, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node_19, 2);

	SpeedDialTrigger(node_20, { color: 'greenToBlue', gradient: true });

	var node_21 = $.sibling(node_20, 2);

	SpeedDial(node_21, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_22 = $.sibling(node_21, 2);

	SpeedDialTrigger(node_22, { color: 'purpleToPink', gradient: true });

	var node_23 = $.sibling(node_22, 2);

	SpeedDial(node_23, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_24 = $.sibling(node_23, 2);

	SpeedDialTrigger(node_24, { color: 'green', outline: true });

	var node_25 = $.sibling(node_24, 2);

	SpeedDial(node_25, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_26 = $.sibling(node_25, 2);

	SpeedDialTrigger(node_26, { color: 'red', outline: true });

	var node_27 = $.sibling(node_26, 2);

	SpeedDial(node_27, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_28 = $.sibling(node_27, 2);

	SpeedDialTrigger(node_28, { color: 'blue', outline: true });

	var node_29 = $.sibling(node_28, 2);

	SpeedDial(node_29, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_30 = $.sibling(node_29, 2);

	SpeedDialTrigger(node_30, { color: 'purple', outline: true });

	var node_31 = $.sibling(node_30, 2);

	SpeedDial(node_31, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_32 = $.sibling(node_31, 2);

	SpeedDialTrigger(node_32, { color: 'blue', gradient: true });

	var node_33 = $.sibling(node_32, 2);

	SpeedDial(node_33, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_34 = $.sibling(node_33, 2);

	SpeedDialTrigger(node_34, { color: 'green', gradient: true });

	var node_35 = $.sibling(node_34, 2);

	SpeedDial(node_35, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_36 = $.sibling(node_35, 2);

	SpeedDialTrigger(node_36, { color: 'cyan', gradient: true });

	var node_37 = $.sibling(node_36, 2);

	SpeedDial(node_37, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_38 = $.sibling(node_37, 2);

	SpeedDialTrigger(node_38, { color: 'teal', gradient: true });

	var node_39 = $.sibling(node_38, 2);

	SpeedDial(node_39, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_40 = $.sibling(node_39, 2);

	SpeedDialTrigger(node_40, { shadow: true, gradient: true, color: 'blue' });

	var node_41 = $.sibling(node_40, 2);

	SpeedDial(node_41, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_42 = $.sibling(node_41, 2);

	SpeedDialTrigger(node_42, { shadow: true, gradient: true, color: 'green' });

	var node_43 = $.sibling(node_42, 2);

	SpeedDial(node_43, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_44 = $.sibling(node_43, 2);

	SpeedDialTrigger(node_44, { shadow: true, gradient: true, color: 'purple' });

	var node_45 = $.sibling(node_44, 2);

	SpeedDial(node_45, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_46 = $.sibling(node_45, 2);

	SpeedDialTrigger(node_46, { shadow: true, gradient: true, color: 'pink' });

	var node_47 = $.sibling(node_46, 2);

	SpeedDial(node_47, {
		children: ($$anchor, $$slotProps) => {
			SpeedDialButton($$anchor, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}