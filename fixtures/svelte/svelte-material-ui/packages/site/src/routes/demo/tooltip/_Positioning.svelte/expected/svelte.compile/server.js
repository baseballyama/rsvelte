import * as $ from 'svelte/internal/server';
import Tooltip, { Wrapper } from '@smui/tooltip';
import Button from '@smui/button';
import { Label } from '@smui/common';

export default function _Positioning($$renderer) {
	$$renderer.push(`<div style="display: flex; flex-wrap: wrap; align-items: center;">`);

	Wrapper($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				touch: true,
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->X Position: Start`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				xPos: 'start',
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Tooltip.`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Wrapper($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				touch: true,
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->X Position: Center`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				xPos: 'center',
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Tooltip.`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Wrapper($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				touch: true,
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->X Position: End`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				xPos: 'end',
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Tooltip.`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Wrapper($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				touch: true,
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Y Position: Above`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				yPos: 'above',
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Tooltip.`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Wrapper($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				touch: true,
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Y Position: Below`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				yPos: 'below',
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Tooltip.`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Wrapper($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				touch: true,
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->X Position: Start, Y Position: Above`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				xPos: 'start',
				yPos: 'above',
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Tooltip.`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}