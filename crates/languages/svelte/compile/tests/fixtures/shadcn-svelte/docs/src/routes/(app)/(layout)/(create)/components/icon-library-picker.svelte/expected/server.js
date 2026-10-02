import * as $ from 'svelte/internal/server';
import LucideSquareIcon from "@lucide/svelte/icons/square";
import * as Item from "$lib/registry/ui/item/index.js";
import HugeiconsIcon from "$lib/components/icon-placeholder/hugeicons-icon.svelte";
import LucideIcon from "$lib/components/icon-placeholder/lucide-icon.svelte";
import PhosphorIcon from "$lib/components/icon-placeholder/phosphor-icon.svelte";
import RemixiconIcon from "$lib/components/icon-placeholder/remixicon-icon.svelte";
import TablerIcon from "$lib/components/icon-placeholder/tabler-icon.svelte";
import HugeiconsLogo from "$lib/registry/icons/logos/hugeicons.svelte";
import LucideLogo from "$lib/registry/icons/logos/lucide.svelte";
import PhosphorLogo from "$lib/registry/icons/logos/phosphor.svelte";
import RemixiconLogo from "$lib/registry/icons/logos/remixicon.svelte";
import TablerLogo from "$lib/registry/icons/logos/tabler.svelte";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { iconLibraries } from "$lib/registry/config.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import * as Picker from "./picker/index.js";
import LockButton from "./lock-button.svelte";

function PlaceholderIcon($$renderer) {
	LucideSquareIcon($$renderer, {});
}

function IconLibraryPreviewLucide($$renderer, previewIcons) {
	$$renderer.push(`<div class="-mx-1 grid w-full grid-cols-7 gap-2"><!--[-->`);

	const each_array = $.ensure_array_like(previewIcons);

	for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
		let iconName = each_array[$$index_1];

		{
			function placeholder($$renderer) {
				PlaceholderIcon($$renderer);
			}

			LucideIcon($$renderer, { icon: iconName, placeholder, $$slots: { placeholder: true } });
		}
	}

	$$renderer.push(`<!--]--></div>`);
}

function IconLibraryPreviewTabler($$renderer, previewIcons) {
	$$renderer.push(`<div class="-mx-1 grid w-full grid-cols-7 gap-2"><!--[-->`);

	const each_array_1 = $.ensure_array_like(previewIcons);

	for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
		let iconName = each_array_1[$$index_2];

		{
			function placeholder($$renderer) {
				PlaceholderIcon($$renderer);
			}

			TablerIcon($$renderer, { icon: iconName, placeholder, $$slots: { placeholder: true } });
		}
	}

	$$renderer.push(`<!--]--></div>`);
}

function IconLibraryPreviewHugeicons($$renderer, previewIcons) {
	$$renderer.push(`<div class="-mx-1 grid w-full grid-cols-7 gap-2"><!--[-->`);

	const each_array_2 = $.ensure_array_like(previewIcons);

	for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
		let iconName = each_array_2[$$index_3];

		{
			function placeholder($$renderer) {
				PlaceholderIcon($$renderer);
			}

			HugeiconsIcon($$renderer, { icon: iconName, placeholder, $$slots: { placeholder: true } });
		}
	}

	$$renderer.push(`<!--]--></div>`);
}

function IconLibraryPreviewPhosphor($$renderer, previewIcons) {
	$$renderer.push(`<div class="-mx-1 grid w-full grid-cols-7 gap-2"><!--[-->`);

	const each_array_3 = $.ensure_array_like(previewIcons);

	for (let $$index_4 = 0, $$length = each_array_3.length; $$index_4 < $$length; $$index_4++) {
		let iconName = each_array_3[$$index_4];

		{
			function placeholder($$renderer) {
				PlaceholderIcon($$renderer);
			}

			PhosphorIcon($$renderer, { icon: iconName, placeholder, $$slots: { placeholder: true } });
		}
	}

	$$renderer.push(`<!--]--></div>`);
}

function IconLibraryPreviewRemixicon($$renderer, previewIcons) {
	$$renderer.push(`<div class="-mx-1 grid w-full grid-cols-7 gap-2"><!--[-->`);

	const each_array_4 = $.ensure_array_like(previewIcons);

	for (let $$index_5 = 0, $$length = each_array_4.length; $$index_5 < $$length; $$index_5++) {
		let iconName = each_array_4[$$index_5];

		{
			function placeholder($$renderer) {
				PlaceholderIcon($$renderer);
			}

			RemixiconIcon($$renderer, { icon: iconName, placeholder, $$slots: { placeholder: true } });
		}
	}

	$$renderer.push(`<!--]--></div>`);
}

export default function Icon_library_picker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { submenu = false } = $$props;
		const designSystem = useDesignSystem();
		const isMobile = new IsMobile();
		const currentIconLibrary = $.derived(() => iconLibraries[designSystem.iconLibrary]);

		const logos = {
			lucide: LucideLogo,
			tabler: TablerLogo,
			hugeicons: HugeiconsLogo,
			phosphor: PhosphorLogo,
			remixicon: RemixiconLogo
		};

		const CurrentLogo = $.derived(() => logos[currentIconLibrary().name]);

		// TODO: none of these icons will actually load until we use them in components
		const PREVIEW_ICONS = {
			lucide: [
				"CopyIcon",
				"CircleAlertIcon",
				"Trash2Icon",
				"ShareIcon",
				"ShoppingBagIcon",
				"MoreHorizontalIcon",
				"Loader2Icon",
				"PlusIcon",
				"MinusIcon",
				"ArrowLeftIcon",
				"ArrowRightIcon",
				"CheckIcon",
				"ChevronDownIcon",
				"ChevronRightIcon"
			],
			tabler: [
				"IconCopy",
				"IconExclamationCircle",
				"IconTrash",
				"IconShare",
				"IconShoppingBag",
				"IconDots",
				"IconLoader",
				"IconPlus",
				"IconMinus",
				"IconArrowLeft",
				"IconArrowRight",
				"IconCheck",
				"IconChevronDown",
				"IconChevronRight"
			],
			hugeicons: [
				"Copy01Icon",
				"AlertCircleIcon",
				"Delete02Icon",
				"Share03Icon",
				"ShoppingBag01Icon",
				"MoreHorizontalCircle01Icon",
				"Loading03Icon",
				"PlusSignIcon",
				"MinusSignIcon",
				"ArrowLeft02Icon",
				"ArrowRight02Icon",
				"Tick02Icon",
				"ArrowDown01Icon",
				"ArrowRight01Icon"
			],
			phosphor: [
				"CopyIcon",
				"WarningCircleIcon",
				"TrashIcon",
				"ShareIcon",
				"BagIcon",
				"DotsThreeIcon",
				"SpinnerIcon",
				"PlusIcon",
				"MinusIcon",
				"ArrowLeftIcon",
				"ArrowRightIcon",
				"CheckIcon",
				"CaretDownIcon",
				"CaretRightIcon"
			],
			remixicon: [
				"RiFileCopyLine",
				"RiErrorWarningLine",
				"RiDeleteBinLine",
				"RiShareLine",
				"RiShoppingBagLine",
				"RiMoreLine",
				"RiLoaderLine",
				"RiAddLine",
				"RiSubtractLine",
				"RiArrowLeftLine",
				"RiArrowRightLine",
				"RiCheckLine",
				"RiArrowDownSLine",
				"RiArrowRightSLine"
			]
		};

		function IconLibraryPreview($$renderer, iconLibrary) {
			const previewIcons = PREVIEW_ICONS[iconLibrary];

			if (previewIcons) {
				$$renderer.push('<!--[0-->');

				if (iconLibrary === "lucide") {
					$$renderer.push('<!--[0-->');
					IconLibraryPreviewLucide($$renderer, previewIcons);
				} else if (iconLibrary === "tabler") {
					$$renderer.push('<!--[1-->');
					IconLibraryPreviewTabler($$renderer, previewIcons);
				} else if (iconLibrary === "hugeicons") {
					$$renderer.push('<!--[2-->');
					IconLibraryPreviewHugeicons($$renderer, previewIcons);
				} else if (iconLibrary === "phosphor") {
					$$renderer.push('<!--[3-->');
					IconLibraryPreviewPhosphor($$renderer, previewIcons);
				} else if (iconLibrary === "remixicon") {
					$$renderer.push('<!--[4-->');
					IconLibraryPreviewRemixicon($$renderer, previewIcons);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="group/picker relative">`);

			if (Picker.Root) {
				$$renderer.push('<!--[-->');

				Picker.Root($$renderer, {
					submenu,
					children: ($$renderer) => {
						if (Picker.Trigger) {
							$$renderer.push('<!--[-->');

							Picker.Trigger($$renderer, {
								submenu,
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Icon Library</div> <div class="text-sm font-medium text-foreground">${$.escape(currentIconLibrary()?.title)}</div></div> <div class="pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center text-base text-foreground select-none *:[svg]:text-foreground!">`);

									if (CurrentLogo()) {
										$$renderer.push('<!--[-->');
										CurrentLogo()($$renderer, { class: 'size-4' });
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

						$$renderer.push(` `);

						if (Picker.Content) {
							$$renderer.push('<!--[-->');

							Picker.Content($$renderer, {
								side: isMobile.current ? "top" : submenu ? "left" : "right",
								align: isMobile.current ? "center" : "start",
								sideOffset: submenu ? 5 : 20,
								submenu,
								children: ($$renderer) => {
									if (Picker.RadioGroup) {
										$$renderer.push('<!--[-->');

										Picker.RadioGroup($$renderer, {
											get value() {
												return designSystem.iconLibrary;
											},

											set value($$value) {
												designSystem.iconLibrary = $$value;
												$$settled = false;
											},

											children: ($$renderer) => {
												if (Picker.Group) {
													$$renderer.push('<!--[-->');

													Picker.Group($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array_5 = $.ensure_array_like(Object.values(iconLibraries));

															for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
																let iconLibrary = each_array_5[index];

																if (Picker.RadioItem) {
																	$$renderer.push('<!--[-->');

																	Picker.RadioItem($$renderer, {
																		closeOnSelect: false,
																		value: iconLibrary.name,
																		class: 'pr-2 *:data-[slot=dropdown-menu-radio-item-indicator]:hidden',
																		children: ($$renderer) => {
																			if (Item.Root) {
																				$$renderer.push('<!--[-->');

																				Item.Root($$renderer, {
																					size: 'sm',
																					children: ($$renderer) => {
																						if (Item.Content) {
																							$$renderer.push('<!--[-->');

																							Item.Content($$renderer, {
																								class: 'gap-1',
																								children: ($$renderer) => {
																									if (Item.Title) {
																										$$renderer.push('<!--[-->');

																										Item.Title($$renderer, {
																											class: 'text-xs font-medium text-muted-foreground',
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->${$.escape(iconLibrary.title)}`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);
																									IconLibraryPreview($$renderer, iconLibrary.name);
																									$$renderer.push(`<!---->`);
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
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (index < Object.values(iconLibraries).length - 1) {
																	$$renderer.push('<!--[0-->');

																	if (Picker.Separator) {
																		$$renderer.push('<!--[-->');
																		Picker.Separator($$renderer, { class: 'opacity-50' });
																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																} else {
																	$$renderer.push('<!--[-1-->');
																}

																$$renderer.push(`<!--]-->`);
															}

															$$renderer.push(`<!--]-->`);
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

			LockButton($$renderer, {
				prop: 'iconLibrary',
				class: 'absolute top-1/2 right-10 -translate-y-1/2'
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}