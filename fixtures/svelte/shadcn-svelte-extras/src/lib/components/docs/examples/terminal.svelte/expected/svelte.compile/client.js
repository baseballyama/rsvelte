import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Terminal from '$lib/components/ui/terminal';

var root = $.from_html(`<span class="text-muted-foreground">┌</span> <span class="bg-yellow-400 px-2 text-black">jsrepo</span> <span class="text-muted-foreground">v1.0.0</span>`, 1);
var root_1 = $.from_html(`Fetching manifest from <span class="text-cyan-500">shadcn-svelte-extras</span>`, 1);
var root_2 = $.from_html(`<span class="text-green-500">◇</span> Fetched manifest from <span class="text-cyan-500">shadcn-svelte-extras</span>`, 1);
var root_3 = $.from_html(`Adding <span class="text-cyan-500">ui/terminal</span>`, 1);
var root_4 = $.from_html(`<span class="text-green-500">◇</span> Added <span class="text-cyan-500">ui/terminal</span>`, 1);
var root_5 = $.from_html(`<span class="text-muted-foreground">└</span> ✓ All done!`, 1);
var root_6 = $.from_html(`<!> <br/> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Terminal_1($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Terminal.Loop, ($$anchor, Terminal_Loop) => {
		Terminal_Loop($$anchor, {
			delay: 5000,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Terminal.Root, ($$anchor, Terminal_Root) => {
					Terminal_Root($$anchor, {
						class: 'h-[275px] leading-5',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_6();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Terminal.TypingAnimation, ($$anchor, Terminal_TypingAnimation) => {
								Terminal_TypingAnimation($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('jsrepo add ui/terminal');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 4);

							$.component(node_3, () => Terminal.AnimatedSpan, ($$anchor, Terminal_AnimatedSpan) => {
								Terminal_AnimatedSpan($$anchor, {
									delay: 1400,
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();

										$.next(4);
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Terminal.AnimatedSpan, ($$anchor, Terminal_AnimatedSpan_1) => {
								Terminal_AnimatedSpan_1($$anchor, {
									delay: 1450,
									class: 'text-muted-foreground',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('│');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							{
								const loadingMessage = ($$anchor) => {
									$.next();

									var fragment_4 = root_1();

									$.next();
									$.append($$anchor, fragment_4);
								};

								const completeMessage = ($$anchor) => {
									var fragment_5 = root_2();

									$.next(2);
									$.append($$anchor, fragment_5);
								};

								$.component(node_5, () => Terminal.Loading, ($$anchor, Terminal_Loading) => {
									Terminal_Loading($$anchor, {
										delay: 1500,
										loadingMessage,
										completeMessage,
										$$slots: { loadingMessage: true, completeMessage: true }
									});
								});
							}

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => Terminal.AnimatedSpan, ($$anchor, Terminal_AnimatedSpan_2) => {
								Terminal_AnimatedSpan_2($$anchor, {
									delay: 2650,
									class: 'text-muted-foreground',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('│');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_6, 2);

							{
								const loadingMessage = ($$anchor) => {
									$.next();

									var fragment_6 = root_3();

									$.next();
									$.append($$anchor, fragment_6);
								};

								const completeMessage = ($$anchor) => {
									var fragment_7 = root_4();

									$.next(2);
									$.append($$anchor, fragment_7);
								};

								$.component(node_7, () => Terminal.Loading, ($$anchor, Terminal_Loading_1) => {
									Terminal_Loading_1($$anchor, {
										delay: 2750,
										loadingMessage,
										completeMessage,
										$$slots: { loadingMessage: true, completeMessage: true }
									});
								});
							}

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => Terminal.AnimatedSpan, ($$anchor, Terminal_AnimatedSpan_3) => {
								Terminal_AnimatedSpan_3($$anchor, {
									delay: 3850,
									class: 'text-muted-foreground',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('│');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							var node_9 = $.sibling(node_8, 2);

							$.component(node_9, () => Terminal.AnimatedSpan, ($$anchor, Terminal_AnimatedSpan_4) => {
								Terminal_AnimatedSpan_4($$anchor, {
									delay: 3900,
									class: 'text-green-500',
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root_5();

										$.next();
										$.append($$anchor, fragment_8);
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