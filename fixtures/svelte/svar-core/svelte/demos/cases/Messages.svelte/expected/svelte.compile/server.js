import * as $ from 'svelte/internal/server';
import { Modal, Text, TextArea, Portal, Button } from "../../src/index";
import { getContext } from "svelte";

export default function Messages($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { showNotice, showModal } = getContext("wx-helpers");

		function notice(type, text) {
			showNotice({ type, expire: -1, text: text || "Button clicked" });
		}

		async function confirm() {
			try {
				await showModal({ title: "Confirm", message: "Will we do it ?" });
			} catch(er) {
				console.log("confirm was rejected", er);
			}
		}

		function alert() {
			showModal({ message: "Something happens", buttons: ["ok"] });
		}

		let custom1 = void 0;
		let custom2 = void 0;

		function hideAll() {
			custom1 = custom2 = false;
		}

		$$renderer.push(`<div class="demo-box"><h3>Notice</h3> <div class="demo-row">`);

		Button($$renderer, {
			type: 'primary',
			onclick: () => notice(""),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show Notice`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => notice("info"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show Info`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => notice("warning"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show Warning`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => notice("success"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show Success`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => notice("danger"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show Danger`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => notice("info", "very long text goes here to show word wrap"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show Long message`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <div class="demo-box"><h3>Confirm / Alert</h3> `);

		Button($$renderer, {
			type: 'primary',
			onclick: confirm,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show Confirm`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: alert,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show Alert`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Custom dialog</h3> `);

		Button($$renderer, {
			type: 'primary',
			onclick: () => custom1 = !custom1,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show Prompt`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (custom1) {
			$$renderer.push('<!--[0-->');

			Portal($$renderer, {
				children: ($$renderer) => {
					Modal($$renderer, {
						title: 'Custom Prompt',
						onconfirm: hideAll,
						oncancel: hideAll,
						children: ($$renderer) => {
							Text($$renderer, { select: true, focus: true, value: 'Some' });
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		Button($$renderer, {
			onclick: () => custom2 = !custom2,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show Dialog`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (custom2) {
			$$renderer.push('<!--[0-->');

			{
				function footer($$renderer) {
					$$renderer.push(`<div style="margin-top: 20px;">`);

					Button($$renderer, {
						onclick: hideAll,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Yes`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						onclick: hideAll,
						children: ($$renderer) => {
							$$renderer.push(`<!---->No`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						onclick: hideAll,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Maybe`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}

				Modal($$renderer, {
					footer,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Some text here `);
						TextArea($$renderer, { placeholder: 'Some text' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { footer: true, default: true }
				});
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}