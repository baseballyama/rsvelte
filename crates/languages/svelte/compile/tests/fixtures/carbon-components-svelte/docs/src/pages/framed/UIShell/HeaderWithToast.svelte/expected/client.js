import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<!> <!>`, 1);

var root_1 = $.from_html(
	`<h1>Clusters</h1> <p>Click the buttons below to trigger toast notifications in different
            positions.</p> <!>`,
	1
);

var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function HeaderWithToast($$anchor) {
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

	var fragment = root_2();
	var node = $.first_child(fragment);

	Header(node, {
		companyName: 'IBM',
		platformName: 'Cloud',
		$$slots: {
			skipToContent: ($$anchor, $$slotProps) => {
				SkipToContent($$anchor, {});
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	$.bind_this(
		NotificationQueue(node_1, {
			get position() {
				return queuePosition;
			}
		}),
		($$value) => queue = $$value,
		() => queue
	);

	var node_2 = $.sibling(node_1, 2);

	Content(node_2, {
		children: ($$anchor, $$slotProps) => {
			Grid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Row($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Column($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Stack($$anchor, {
										gap: 6,
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root_1();
											var node_3 = $.sibling($.first_child(fragment_6), 4);

											ButtonSet(node_3, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root();
													var node_4 = $.first_child(fragment_7);

													Button(node_4, {
														$$events: { click: () => triggerToast("top-right") },
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Top right');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});

													var node_5 = $.sibling(node_4, 2);

													Button(node_5, {
														$$events: { click: () => triggerToast("bottom-right") },
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Bottom right');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_6);
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

	$.append($$anchor, fragment);
}