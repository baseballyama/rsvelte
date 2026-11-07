import * as $ from 'svelte/internal/server';
import { Separator, Toolbar } from "bits-ui";
import Sparkle from "phosphor-svelte/lib/Sparkle";
import TextAlignCenter from "phosphor-svelte/lib/TextAlignCenter";
import TextAlignLeft from "phosphor-svelte/lib/TextAlignLeft";
import TextAlignRight from "phosphor-svelte/lib/TextAlignRight";
import TextB from "phosphor-svelte/lib/TextB";
import TextItalic from "phosphor-svelte/lib/TextItalic";
import TextStrikethrough from "phosphor-svelte/lib/TextStrikethrough";

export default function Toolbar_demo($$renderer) {
	let text = ["bold"];
	let align = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Toolbar.Root) {
			$$renderer.push('<!--[-->');

			Toolbar.Root($$renderer, {
				class: 'rounded-10px border-border bg-background-alt shadow-mini flex h-12 min-w-max items-center justify-center border px-[4px] py-1',
				children: ($$renderer) => {
					if (Toolbar.Group) {
						$$renderer.push('<!--[-->');

						Toolbar.Group($$renderer, {
							type: 'multiple',
							class: 'flex items-center gap-x-0.5',
							get value() {
								return text;
							},

							set value($$value) {
								text = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Toolbar.GroupItem) {
									$$renderer.push('<!--[-->');

									Toolbar.GroupItem($$renderer, {
										'aria-label': 'toggle bold',
										value: 'bold',
										class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
										children: ($$renderer) => {
											TextB($$renderer, { class: 'size-6' });
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Toolbar.GroupItem) {
									$$renderer.push('<!--[-->');

									Toolbar.GroupItem($$renderer, {
										'aria-label': 'toggle italic',
										value: 'italic',
										class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
										children: ($$renderer) => {
											TextItalic($$renderer, { class: 'size-6' });
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Toolbar.GroupItem) {
									$$renderer.push('<!--[-->');

									Toolbar.GroupItem($$renderer, {
										'aria-label': 'toggle strikethrough',
										value: 'strikethrough',
										class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
										children: ($$renderer) => {
											TextStrikethrough($$renderer, { class: 'size-6' });
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Separator.Root) {
						$$renderer.push('<!--[-->');
						Separator.Root($$renderer, { class: 'bg-dark-10 -my-1 mx-1 w-[1px] self-stretch' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Toolbar.Group) {
						$$renderer.push('<!--[-->');

						Toolbar.Group($$renderer, {
							type: 'single',
							class: 'flex items-center gap-x-0.5',
							get value() {
								return align;
							},

							set value($$value) {
								align = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Toolbar.GroupItem) {
									$$renderer.push('<!--[-->');

									Toolbar.GroupItem($$renderer, {
										'aria-label': 'align left',
										value: 'left',
										class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
										children: ($$renderer) => {
											TextAlignLeft($$renderer, { class: 'size-6' });
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Toolbar.GroupItem) {
									$$renderer.push('<!--[-->');

									Toolbar.GroupItem($$renderer, {
										'aria-label': 'align center',
										value: 'center',
										class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
										children: ($$renderer) => {
											TextAlignCenter($$renderer, { class: 'size-6' });
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Toolbar.GroupItem) {
									$$renderer.push('<!--[-->');

									Toolbar.GroupItem($$renderer, {
										'aria-label': 'align right',
										value: 'right',
										class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
										children: ($$renderer) => {
											TextAlignRight($$renderer, { class: 'size-6' });
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Separator.Root) {
						$$renderer.push('<!--[-->');
						Separator.Root($$renderer, { class: 'bg-dark-10 -my-1 mx-1 w-[1px] self-stretch' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` <div class="flex items-center">`);

					if (Toolbar.Button) {
						$$renderer.push('<!--[-->');

						Toolbar.Button($$renderer, {
							class: 'rounded-9px text-foreground/80 hover:bg-muted active:bg-dark-10 inline-flex items-center justify-center  px-3 py-2 text-sm font-medium transition-all active:scale-[0.98]',
							children: ($$renderer) => {
								Sparkle($$renderer, { class: 'mr-2 size-6' });
								$$renderer.push(`<!----> <span>Ask AI</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}