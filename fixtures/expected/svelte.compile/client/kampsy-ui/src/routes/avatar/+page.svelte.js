import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CircleArrowUp, CircleCheck, Info } from "@lucide/svelte";
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import { Avatar, AvatarGroup, AvatarWithIcon } from "$lib/index.js";
import Pagination from "$lib/pagination/pagination.svelte";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

import {
	avatarFixedOverlap,
	avatarGroup,
	avatarGroupReverse,
	avatarLetter,
	avatarOverlap,
	avatarPlaceholder,
	avatarSize,
	avatarWithIcon
} from "../../docs/data/avatar.js";

const avatar = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
};

const demoAndCode = ($$anchor, demo = $.noop, code = $.noop) => {
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.snippet(node, demo);
	$.reset(div_2);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	CollapseCode(node_1, {
		get code() {
			return code();
		}
	});

	$.reset(div);
	$.append($$anchor, div);
};

const roundedCode = ($$anchor, rct = $.noop) => {
	var code_1 = root_2();
	var text = $.only_child(code_1, true);

	$.template_effect(() => $.set_text(text, rct()));
	$.append($$anchor, code_1);
};

const size = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root_4();
			var node_24 = $.first_child(fragment_11);

			LinkH2(node_24, {
				href: '/avatar#size',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('size');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var div_13 = $.sibling(node_24, 2);

			{
				const demo = ($$anchor) => {
					var div_14 = root_9();
					var node_25 = $.child(div_14);

					Avatar(node_25, { size: 24, username: 'evilrabbit' });

					var node_26 = $.sibling(node_25, 2);

					Avatar(node_26, { size: 32, username: 'evilrabbit' });

					var node_27 = $.sibling(node_26, 2);

					Avatar(node_27, { size: 48, username: 'evilrabbit' });
					$.reset(div_14);
					$.append($$anchor, div_14);
				};

				var node_28 = $.child(div_13);

				demoAndCode(node_28, () => demo, () => avatarSize);
				$.reset(div_13);
			}

			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});
};

const withIcon = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root_4();
			var node_29 = $.first_child(fragment_13);

			LinkH2(node_29, {
				href: '/avatar#with-custom-icon',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('with custom icon');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var div_15 = $.sibling(node_29, 2);

			{
				const demo = ($$anchor) => {
					var div_16 = root_9();
					var node_30 = $.child(div_16);

					{
						const icon = ($$anchor) => {
							CircleArrowUp($$anchor, {});
						};

						AvatarWithIcon(node_30, {
							size: 32,
							iconBackground: true,
							role: 'img',
							'aria-label': 'Upload avatar',
							icon,
							$$slots: { icon: true }
						});
					}

					var node_31 = $.sibling(node_30, 2);

					{
						const icon = ($$anchor) => {
							CircleCheck($$anchor, {});
						};

						AvatarWithIcon(node_31, {
							size: 32,
							iconBackground: true,
							role: 'img',
							'aria-label': 'Verified avatar',
							icon,
							$$slots: { icon: true }
						});
					}

					var node_32 = $.sibling(node_31, 2);

					{
						const icon = ($$anchor) => {
							Info($$anchor, {});
						};

						AvatarWithIcon(node_32, {
							size: 32,
							iconBackground: true,
							role: 'img',
							'aria-label': 'Information avatar',
							icon,
							$$slots: { icon: true }
						});
					}

					$.reset(div_16);
					$.append($$anchor, div_16);
				};

				var node_33 = $.child(div_15);

				demoAndCode(node_33, () => demo, () => avatarWithIcon);
				$.reset(div_15);
			}

			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});
};

const letter = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_18 = root_4();
			var node_34 = $.first_child(fragment_18);

			LinkH2(node_34, {
				href: '/avatar#letter',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('letter');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var div_17 = $.sibling(node_34, 2);

			{
				const demo = ($$anchor) => {
					var div_18 = root_9();
					var node_35 = $.child(div_18);

					Avatar(node_35, { letter: 'SL', size: 32 });

					var node_36 = $.sibling(node_35, 2);

					Avatar(node_36, { letter: 'EK', size: 32 });

					var node_37 = $.sibling(node_36, 2);

					Avatar(node_37, { letter: 'CK', size: 32 });
					$.reset(div_18);
					$.append($$anchor, div_18);
				};

				var node_38 = $.child(div_17);

				demoAndCode(node_38, () => demo, () => avatarLetter);
				$.reset(div_17);
			}

			$.append($$anchor, fragment_18);
		},
		$$slots: { default: true }
	});
};

const placeholder = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_20 = root_4();
			var node_39 = $.first_child(fragment_20);

			LinkH2(node_39, {
				href: '/avatar#placeholder',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('placeholder');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			var div_19 = $.sibling(node_39, 2);

			{
				const demo = ($$anchor) => {
					Avatar($$anchor, { placeholder: true, size: 90 });
				};

				var node_40 = $.child(div_19);

				demoAndCode(node_40, () => demo, () => avatarPlaceholder);
				$.reset(div_19);
			}

			$.append($$anchor, fragment_20);
		},
		$$slots: { default: true }
	});
};

const bestPractices = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_23 = root_11();
			var ul = $.sibling($.first_child(fragment_23), 2);
			var li = $.child(ul);
			var node_41 = $.sibling($.child(li));

			roundedCode(node_41, () => "Avatar");

			var node_42 = $.sibling(node_41, 2);

			roundedCode(node_42, () => "AvatarGroup");
			$.next();
			$.reset(li);

			var li_1 = $.sibling(li, 2);
			var node_43 = $.sibling($.child(li_1));

			roundedCode(node_43, () => "src");

			var node_44 = $.sibling(node_43, 2);

			roundedCode(node_44, () => "letter");

			var node_45 = $.sibling(node_44, 2);

			roundedCode(node_45, () => "placeholder");
			$.next();
			$.reset(li_1);

			var li_2 = $.sibling(li_1, 2);
			var node_46 = $.child(li_2);

			roundedCode(node_46, () => "title");

			var node_47 = $.sibling(node_46, 2);

			roundedCode(node_47, () => "Acme Inc.");

			var node_48 = $.sibling(node_47, 2);

			roundedCode(node_48, () => "Jane Doe");

			var node_49 = $.sibling(node_48, 2);

			roundedCode(node_49, () => "Avatar of …");
			$.next();
			$.reset(li_2);

			var li_3 = $.sibling(li_2, 2);
			var node_50 = $.sibling($.child(li_3));

			roundedCode(node_50, () => "letter");

			var node_51 = $.sibling(node_50, 2);

			roundedCode(node_51, () => "?");
			$.next();
			$.reset(li_3);
			$.next(2);
			$.reset(ul);
			$.append($$anchor, fragment_23);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "introduction", href: "/" },
				next: { title: "badge", href: "/badge" }
			});
		},
		$$slots: { default: true }
	});
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">avatar</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Avatars represent a user or a team. Stacked avatars represent a group of people.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="flex w-full flex-wrap justify-between gap-4"><!></div></div> <!></div>`);
var root_2 = $.from_html(`<code class="text-kui-light-gray-900 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 dark:text-kui-dark-gray-900 border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-md border px-2 py-[3.6px] text-xs"> </code>`);
var root_3 = $.from_html(`<div class="flex items-center gap-4"><div><!></div> <div><!></div></div>`);
var root_4 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_5 = $.from_html(`<div class="flex items-center gap-4"><!> <!></div>`);

var root_6 = $.from_html(
	`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">By default the first member sits on top of the stack, so the first credited author stays
			the most prominent. Set <!> to flip the order so the last member
			sits on top instead. The visual left-to-right order is unchanged.</p> <div class="mt-4 xl:mt-7"><!></div>`,
	1
);

var root_7 = $.from_html(`<div class="flex items-center gap-6"><!> <!> <!> <!></div>`);
var root_8 = $.from_html(`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">By default <!> scales the spacing with <!>, keeping a generous, evenly-spaced cluster at any size.</p> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_9 = $.from_html(`<div class="flex items-center gap-6"><!> <!> <!></div>`);

var root_10 = $.from_html(
	`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Pass a number to set the overlap in pixels instead. Lower values give more generous
			spacing; higher values pack tighter for dense, space-constrained UI.</p> <div class="mt-4 xl:mt-7"><!></div>`,
	1
);

var root_11 = $.from_html(
	`<h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize">Best Practices</h2> <ul class="mt-4 list-disc"><li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Use a single <!> for one person, team, or organization. For two
				or more stacked avatars, use <!> so the cluster gets correct
				overlap, sizing, and a single accessible label.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Pass <!> first and fall back to <!> (1–2 uppercase chars) when the image is missing. Reserve <!> for the loading shell, never as a permanent fallback.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal"><!> is the literal entity name (<!>, <!>). The component already prefixes letter avatars
				with "Avatar with initials:" for screen readers, so don't hand-write <!>.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Keep <!> uppercase and derived from the entity name. No emoji,
				no punctuation, no <!>.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Pick a size that matches adjacent type: 20–24 px next to small text, 32 px next to body
				text, 48–64 px in headers and onboarding states.</li></ul>`,
	1
);

var root_12 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	const group = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_4();
				var node_2 = $.first_child(fragment_3);

				LinkH2(node_2, {
					href: '/avatar#group',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('group');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var div_3 = $.sibling(node_2, 2);

				{
					const demo = ($$anchor) => {
						var div_4 = root_3();
						var div_5 = $.child(div_4);
						var node_3 = $.child(div_5);

						{
							let $0 = $.derived(() => members.slice(0, 3));

							AvatarGroup(node_3, {
								get members() {
									return $.get($0);
								},
								size: 32
							});
						}

						$.reset(div_5);

						var div_6 = $.sibling(div_5, 2);
						var node_4 = $.child(div_6);

						AvatarGroup(node_4, {
							limit: 4,
							get members() {
								return members;
							},
							size: 32
						});

						$.reset(div_6);
						$.reset(div_4);
						$.append($$anchor, div_4);
					};

					var node_5 = $.child(div_3);

					demoAndCode(node_5, () => demo, () => avatarGroup);
					$.reset(div_3);
				}

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	};

	const stackingOrder = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root_6();
				var node_6 = $.first_child(fragment_5);

				LinkH2(node_6, {
					href: '/avatar#stacking-order',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('stacking order');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var p = $.sibling(node_6, 2);
				var node_7 = $.sibling($.child(p));

				roundedCode(node_7, () => "reverse");
				$.next();
				$.reset(p);

				var div_7 = $.sibling(p, 2);

				{
					const demo = ($$anchor) => {
						var div_8 = root_5();
						var node_8 = $.child(div_8);

						{
							let $0 = $.derived(() => members.slice(0, 3));

							AvatarGroup(node_8, {
								get members() {
									return $.get($0);
								},
								size: 32
							});
						}

						var node_9 = $.sibling(node_8, 2);

						{
							let $0 = $.derived(() => members.slice(0, 3));

							AvatarGroup(node_9, {
								get members() {
									return $.get($0);
								},
								size: 32,
								reverse: true
							});
						}

						$.reset(div_8);
						$.append($$anchor, div_8);
					};

					var node_10 = $.child(div_7);

					demoAndCode(node_10, () => demo, () => avatarGroupReverse);
					$.reset(div_7);
				}

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	};

	const overlap = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root_8();
				var node_11 = $.first_child(fragment_7);

				LinkH2(node_11, {
					href: '/avatar#overlap',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('overlap');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var p_1 = $.sibling(node_11, 2);
				var node_12 = $.sibling($.child(p_1));

				roundedCode(node_12, () => 'overlap="auto"');

				var node_13 = $.sibling(node_12, 2);

				roundedCode(node_13, () => "size");
				$.next();
				$.reset(p_1);

				var div_9 = $.sibling(p_1, 2);

				{
					const demo = ($$anchor) => {
						var div_10 = root_7();
						var node_14 = $.child(div_10);

						{
							let $0 = $.derived(() => members.slice(0, 3));

							AvatarGroup(node_14, {
								get members() {
									return $.get($0);
								},
								overlap: 'auto',
								size: 16
							});
						}

						var node_15 = $.sibling(node_14, 2);

						{
							let $0 = $.derived(() => members.slice(0, 3));

							AvatarGroup(node_15, {
								get members() {
									return $.get($0);
								},
								overlap: 'auto',
								size: 24
							});
						}

						var node_16 = $.sibling(node_15, 2);

						{
							let $0 = $.derived(() => members.slice(0, 3));

							AvatarGroup(node_16, {
								get members() {
									return $.get($0);
								},
								overlap: 'auto',
								size: 32
							});
						}

						var node_17 = $.sibling(node_16, 2);

						{
							let $0 = $.derived(() => members.slice(0, 3));

							AvatarGroup(node_17, {
								get members() {
									return $.get($0);
								},
								overlap: 'auto',
								size: 48
							});
						}

						$.reset(div_10);
						$.append($$anchor, div_10);
					};

					var node_18 = $.child(div_9);

					demoAndCode(node_18, () => demo, () => avatarOverlap);
					$.reset(div_9);
				}

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	};

	const fixedOverlap = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_9 = root_10();
				var node_19 = $.first_child(fragment_9);

				LinkH2(node_19, {
					href: '/avatar#fixed-overlap',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('fixed overlap');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var div_11 = $.sibling(node_19, 4);

				{
					const demo = ($$anchor) => {
						var div_12 = root_9();
						var node_20 = $.child(div_12);

						{
							let $0 = $.derived(() => members.slice(0, 3));

							AvatarGroup(node_20, {
								get members() {
									return $.get($0);
								},
								overlap: 10,
								size: 24
							});
						}

						var node_21 = $.sibling(node_20, 2);

						{
							let $0 = $.derived(() => members.slice(0, 3));

							AvatarGroup(node_21, {
								get members() {
									return $.get($0);
								},
								overlap: 6,
								size: 24
							});
						}

						var node_22 = $.sibling(node_21, 2);

						{
							let $0 = $.derived(() => members.slice(0, 3));

							AvatarGroup(node_22, {
								get members() {
									return $.get($0);
								},
								overlap: 0,
								size: 24
							});
						}

						$.reset(div_12);
						$.append($$anchor, div_12);
					};

					var node_23 = $.child(div_11);

					demoAndCode(node_23, () => demo, () => avatarFixedOverlap);
					$.reset(div_11);
				}

				$.append($$anchor, fragment_9);
			},
			$$slots: { default: true }
		});
	};

	const cont = ($$anchor) => {
		var fragment_26 = root_12();
		var node_52 = $.first_child(fragment_26);

		avatar(node_52);

		var node_53 = $.sibling(node_52, 2);

		group(node_53);

		var node_54 = $.sibling(node_53, 2);

		stackingOrder(node_54);

		var node_55 = $.sibling(node_54, 2);

		overlap(node_55);

		var node_56 = $.sibling(node_55, 2);

		fixedOverlap(node_56);

		var node_57 = $.sibling(node_56, 2);

		size(node_57);

		var node_58 = $.sibling(node_57, 2);

		withIcon(node_58);

		var node_59 = $.sibling(node_58, 2);

		letter(node_59);

		var node_60 = $.sibling(node_59, 2);

		placeholder(node_60);

		var node_61 = $.sibling(node_60, 2);

		bestPractices(node_61);

		var node_62 = $.sibling(node_61, 2);

		prevAndNext(node_62);
		$.append($$anchor, fragment_26);
	};

	const members = [
		{ username: "evilrabbit" },
		{ username: "severinlandolt" },
		{ username: "rauchg" },
		{ username: "christopherkindl" },
		{ username: "rauno" },
		{ username: "shuding" },
		{ username: "skllcrn" },
		{ username: "almonk" }
	];

	$.head('5za1fe', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Avatar';
		});
	});

	Shell($$anchor, {
		get asideSlot() {
			return aside;
		},

		get contSlot() {
			return cont;
		}
	});
}