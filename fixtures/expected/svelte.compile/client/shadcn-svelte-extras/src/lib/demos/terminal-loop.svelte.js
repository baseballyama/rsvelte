import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Terminal from '$lib/components/ui/terminal';

var root = $.from_html(`<span class="text-green-500">✔ Retrieved blocks from github/ieedan/shadcn-svelte-extras</span>`);
var root_1 = $.from_html(`<span class="text-green-500">✔ Added ui/terminal</span>`);
var root_2 = $.from_html(`<span class="text-green-500">✔ Installed runed@^0.23.4</span>`);
var root_3 = $.from_html(`<span>✔ All done.</span>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Terminal_loop($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Terminal.Loop, ($$anchor, Terminal_Loop) => {
		Terminal_Loop($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Terminal.Root, ($$anchor, Terminal_Root) => {
					Terminal_Root($$anchor, {
						class: 'm-6 max-w-xl',
						delay: 250,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_4();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Terminal.TypingAnimation, ($$anchor, Terminal_TypingAnimation) => {
								Terminal_TypingAnimation($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('> jsrepo add ui/terminal');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							{
								const loadingMessage = ($$anchor) => {
									$.next();

									var text_1 = $.text('Fetching manifest');

									$.append($$anchor, text_1);
								};

								const completeMessage = ($$anchor) => {
									var span = root();

									$.append($$anchor, span);
								};

								$.component(node_3, () => Terminal.Loading, ($$anchor, Terminal_Loading) => {
									Terminal_Loading($$anchor, {
										delay: 1500,
										loadingMessage,
										completeMessage,
										$$slots: { loadingMessage: true, completeMessage: true }
									});
								});
							}

							var node_4 = $.sibling(node_3, 2);

							{
								const loadingMessage = ($$anchor) => {
									$.next();

									var text_2 = $.text('Adding ui/terminal');

									$.append($$anchor, text_2);
								};

								const completeMessage = ($$anchor) => {
									var span_1 = root_1();

									$.append($$anchor, span_1);
								};

								$.component(node_4, () => Terminal.Loading, ($$anchor, Terminal_Loading_1) => {
									Terminal_Loading_1($$anchor, {
										delay: 2750,
										loadingMessage,
										completeMessage,
										$$slots: { loadingMessage: true, completeMessage: true }
									});
								});
							}

							var node_5 = $.sibling(node_4, 2);

							{
								const loadingMessage = ($$anchor) => {
									$.next();

									var text_3 = $.text('Installing dependencies');

									$.append($$anchor, text_3);
								};

								const completeMessage = ($$anchor) => {
									var span_2 = root_2();

									$.append($$anchor, span_2);
								};

								$.component(node_5, () => Terminal.Loading, ($$anchor, Terminal_Loading_2) => {
									Terminal_Loading_2($$anchor, {
										delay: 4000,
										loadingMessage,
										completeMessage,
										$$slots: { loadingMessage: true, completeMessage: true }
									});
								});
							}

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => Terminal.AnimatedSpan, ($$anchor, Terminal_AnimatedSpan) => {
								Terminal_AnimatedSpan($$anchor, {
									delay: 5250,
									class: 'text-green-500',
									children: ($$anchor, $$slotProps) => {
										var span_3 = root_3();

										$.append($$anchor, span_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}