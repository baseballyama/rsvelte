import * as $ from 'svelte/internal/server';
import { Button, ButtonSet, Stack, ToastNotification } from "carbon-components-svelte";

export default function ToastNotificationReusable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = false;
		let kind = "error";
		let title = "Error";
		let subtitle = "An internal server error occurred.";
		let caption = new Date().toLocaleString();

		function showError() {
			kind = "error";
			title = "Error";
			subtitle = "An internal server error occurred.";
			caption = new Date().toLocaleString();
			open = true;
		}

		function showSuccess() {
			kind = "success";
			title = "Success";
			subtitle = "Your settings have been saved.";
			caption = new Date().toLocaleString();
			open = true;
		}

		function showWarning() {
			kind = "warning";
			title = "Warning";
			subtitle = "Please review your changes before continuing.";
			caption = new Date().toLocaleString();
			open = true;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Stack($$renderer, {
				gap: 5,
				children: ($$renderer) => {
					ButtonSet($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Show success`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								kind: 'ghost',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Show warning`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								kind: 'danger-ghost',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Show error`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToastNotification($$renderer, {
						kind,
						title,
						subtitle,
						caption,
						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}