import * as $ from 'svelte/internal/server';

import {
	Button,
	ButtonSet,
	Column,
	Content,
	Grid,
	Header,
	NotificationQueue,
	Row,
	SkipToContent,
	Stack
} from "carbon-components-svelte";

export default function HeaderWithToast($$renderer) {
	let queue;
	let queuePosition = "top-right";

	const triggerToast = (position) => {
		queuePosition = position;

		queue.add({
			kind: "success",
			title: "Cluster created",
			subtitle: "Your Kubernetes cluster is now provisioning.",
			timeout: 5000
		});
	};

	Header($$renderer, {
		companyName: 'IBM',
		platformName: 'Cloud',
		$$slots: {
			skipToContent: ($$renderer) => {
				{
					SkipToContent($$renderer, {});
				}
			}
		}
	});

	$$renderer.push(`<!----> `);
	NotificationQueue($$renderer, { position: queuePosition });
	$$renderer.push(`<!----> `);

	Content($$renderer, {
		children: ($$renderer) => {
			Grid($$renderer, {
				children: ($$renderer) => {
					Row($$renderer, {
						children: ($$renderer) => {
							Column($$renderer, {
								children: ($$renderer) => {
									Stack($$renderer, {
										gap: 6,
										children: ($$renderer) => {
											$$renderer.push(`<h1>Clusters</h1> <p>Click the buttons below to trigger toast notifications in different
            positions.</p> `);

											ButtonSet($$renderer, {
												children: ($$renderer) => {
													Button($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Top right`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													Button($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Bottom right`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!---->`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}