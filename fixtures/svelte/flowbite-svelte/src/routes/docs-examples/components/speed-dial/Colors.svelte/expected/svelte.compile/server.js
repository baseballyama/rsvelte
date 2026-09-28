import * as $ from 'svelte/internal/server';
import { SpeedDial, SpeedDialTrigger, SpeedDialButton } from "flowbite-svelte";
import { ShareNodesSolid } from "flowbite-svelte-icons";

export default function Colors($$renderer) {
	$$renderer.push(`<div class="grid w-fit grid-cols-8 gap-x-6 gap-y-18">`);
	SpeedDialTrigger($$renderer, { color: 'red' });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'purple' });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'light' });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'dark' });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'red' });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'green' });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'yellow' });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'blue' });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'purpleToBlue', gradient: true });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'cyanToBlue', gradient: true });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'greenToBlue', gradient: true });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'purpleToPink', gradient: true });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'green', outline: true });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'red', outline: true });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'blue', outline: true });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'purple', outline: true });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'blue', gradient: true });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'green', gradient: true });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'cyan', gradient: true });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { color: 'teal', gradient: true });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { shadow: true, gradient: true, color: 'blue' });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { shadow: true, gradient: true, color: 'green' });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { shadow: true, gradient: true, color: 'purple' });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { shadow: true, gradient: true, color: 'pink' });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}