import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

const PlaceholderIcon = ($$anchor) => {
	LucideSquareIcon($$anchor, {});
};

const IconLibraryPreviewLucide = ($$anchor, previewIcons = $.noop) => {
	var div = root();

	$.each(div, 20, previewIcons, (iconName) => iconName, ($$anchor, iconName) => {
		{
			const placeholder = ($$anchor) => {
				PlaceholderIcon($$anchor);
			};

			LucideIcon($$anchor, {
				get icon() {
					return iconName;
				},
				placeholder,
				$$slots: { placeholder: true }
			});
		}
	});

	$.reset(div);
	$.append($$anchor, div);
};

const IconLibraryPreviewTabler = ($$anchor, previewIcons = $.noop) => {
	var div_1 = root();

	$.each(div_1, 20, previewIcons, (iconName) => iconName, ($$anchor, iconName) => {
		{
			const placeholder = ($$anchor) => {
				PlaceholderIcon($$anchor);
			};

			TablerIcon($$anchor, {
				get icon() {
					return iconName;
				},
				placeholder,
				$$slots: { placeholder: true }
			});
		}
	});

	$.reset(div_1);
	$.append($$anchor, div_1);
};

const IconLibraryPreviewHugeicons = ($$anchor, previewIcons = $.noop) => {
	var div_2 = root();

	$.each(div_2, 20, previewIcons, (iconName) => iconName, ($$anchor, iconName) => {
		{
			const placeholder = ($$anchor) => {
				PlaceholderIcon($$anchor);
			};

			HugeiconsIcon($$anchor, {
				get icon() {
					return iconName;
				},
				placeholder,
				$$slots: { placeholder: true }
			});
		}
	});

	$.reset(div_2);
	$.append($$anchor, div_2);
};

const IconLibraryPreviewPhosphor = ($$anchor, previewIcons = $.noop) => {
	var div_3 = root();

	$.each(div_3, 20, previewIcons, (iconName) => iconName, ($$anchor, iconName) => {
		{
			const placeholder = ($$anchor) => {
				PlaceholderIcon($$anchor);
			};

			PhosphorIcon($$anchor, {
				get icon() {
					return iconName;
				},
				placeholder,
				$$slots: { placeholder: true }
			});
		}
	});

	$.reset(div_3);
	$.append($$anchor, div_3);
};

const IconLibraryPreviewRemixicon = ($$anchor, previewIcons = $.noop) => {
	var div_4 = root();

	$.each(div_4, 20, previewIcons, (iconName) => iconName, ($$anchor, iconName) => {
		{
			const placeholder = ($$anchor) => {
				PlaceholderIcon($$anchor);
			};

			RemixiconIcon($$anchor, {
				get icon() {
					return iconName;
				},
				placeholder,
				$$slots: { placeholder: true }
			});
		}
	});

	$.reset(div_4);
	$.append($$anchor, div_4);
};

var root = $.from_html(`<div class="-mx-1 grid w-full grid-cols-7 gap-2"></div>`);
var root_1 = $.from_html(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Icon Library</div> <div class="text-sm font-medium text-foreground"> </div></div> <div class="pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center text-base text-foreground select-none *:[svg]:text-foreground!"><!></div>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="group/picker relative"><!> <!></div>`);

export default function Icon_library_picker($$anchor, $$props) {
	$.push($$props, true);

	const // TODO: none of these icons will actually load until we use them in components
	IconLibraryPreview = ($$anchor, iconLibrary = $.noop) => {
		const previewIcons = $.derived(() => PREVIEW_ICONS[iconLibrary()]);
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent_5 = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						IconLibraryPreviewLucide($$anchor, () => $.get(previewIcons));
					};

					var consequent_1 = ($$anchor) => {
						IconLibraryPreviewTabler($$anchor, () => $.get(previewIcons));
					};

					var consequent_2 = ($$anchor) => {
						IconLibraryPreviewHugeicons($$anchor, () => $.get(previewIcons));
					};

					var consequent_3 = ($$anchor) => {
						IconLibraryPreviewPhosphor($$anchor, () => $.get(previewIcons));
					};

					var consequent_4 = ($$anchor) => {
						IconLibraryPreviewRemixicon($$anchor, () => $.get(previewIcons));
					};

					$.if(node_1, ($$render) => {
						if (iconLibrary() === "lucide") $$render(consequent); else if (iconLibrary() === "tabler") $$render(consequent_1, 1); else if (iconLibrary() === "hugeicons") $$render(consequent_2, 2); else if (iconLibrary() === "phosphor") $$render(consequent_3, 3); else if (iconLibrary() === "remixicon") $$render(consequent_4, 4);
					});
				}

				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if ($.get(previewIcons)) $$render(consequent_5);
			});
		}

		$.append($$anchor, fragment);
	};

	let submenu = $.prop($$props, 'submenu', 3, false);
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

	const CurrentLogo = $.derived(() => logos[$.get(currentIconLibrary).name]);

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

	var div_5 = root_3();
	var node_2 = $.child(div_5);

	$.component(node_2, () => Picker.Root, ($$anchor, Picker_Root) => {
		Picker_Root($$anchor, {
			get submenu() {
				return submenu();
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_18 = root_2();
				var node_3 = $.first_child(fragment_18);

				$.component(node_3, () => Picker.Trigger, ($$anchor, Picker_Trigger) => {
					Picker_Trigger($$anchor, {
						get submenu() {
							return submenu();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_19 = root_1();
							var div_6 = $.first_child(fragment_19);
							var div_7 = $.sibling($.child(div_6), 2);
							var text = $.only_child(div_7, true);

							$.reset(div_6);

							var div_8 = $.sibling(div_6, 2);
							var node_4 = $.child(div_8);

							$.component(node_4, () => $.get(CurrentLogo), ($$anchor, CurrentLogo_1) => {
								CurrentLogo_1($$anchor, { class: 'size-4' });
							});

							$.reset(div_8);
							$.template_effect(() => $.set_text(text, $.get(currentIconLibrary)?.title));
							$.append($$anchor, fragment_19);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_3, 2);

				{
					let $0 = $.derived(() => isMobile.current ? "top" : submenu() ? "left" : "right");
					let $1 = $.derived(() => isMobile.current ? "center" : "start");
					let $2 = $.derived(() => submenu() ? 5 : 20);

					$.component(node_5, () => Picker.Content, ($$anchor, Picker_Content) => {
						Picker_Content($$anchor, {
							get side() {
								return $.get($0);
							},

							get align() {
								return $.get($1);
							},

							get sideOffset() {
								return $.get($2);
							},

							get submenu() {
								return submenu();
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_20 = $.comment();
								var node_6 = $.first_child(fragment_20);

								$.component(node_6, () => Picker.RadioGroup, ($$anchor, Picker_RadioGroup) => {
									Picker_RadioGroup($$anchor, {
										get value() {
											return designSystem.iconLibrary;
										},

										set value($$value) {
											designSystem.iconLibrary = $$value;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_21 = $.comment();
											var node_7 = $.first_child(fragment_21);

											$.component(node_7, () => Picker.Group, ($$anchor, Picker_Group) => {
												Picker_Group($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_22 = $.comment();
														var node_8 = $.first_child(fragment_22);

														$.each(node_8, 19, () => Object.values(iconLibraries), (iconLibrary) => iconLibrary.name, ($$anchor, iconLibrary, index) => {
															var fragment_23 = root_2();
															var node_9 = $.first_child(fragment_23);

															$.component(node_9, () => Picker.RadioItem, ($$anchor, Picker_RadioItem) => {
																Picker_RadioItem($$anchor, {
																	closeOnSelect: false,
																	get value() {
																		return $.get(iconLibrary).name;
																	},
																	class: 'pr-2 *:data-[slot=dropdown-menu-radio-item-indicator]:hidden',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_24 = $.comment();
																		var node_10 = $.first_child(fragment_24);

																		$.component(node_10, () => Item.Root, ($$anchor, Item_Root) => {
																			Item_Root($$anchor, {
																				size: 'sm',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_25 = $.comment();
																					var node_11 = $.first_child(fragment_25);

																					$.component(node_11, () => Item.Content, ($$anchor, Item_Content) => {
																						Item_Content($$anchor, {
																							class: 'gap-1',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_26 = root_2();
																								var node_12 = $.first_child(fragment_26);

																								$.component(node_12, () => Item.Title, ($$anchor, Item_Title) => {
																									Item_Title($$anchor, {
																										class: 'text-xs font-medium text-muted-foreground',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_1 = $.text();

																											$.template_effect(() => $.set_text(text_1, $.get(iconLibrary).title));
																											$.append($$anchor, text_1);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_13 = $.sibling(node_12, 2);

																								IconLibraryPreview(node_13, () => $.get(iconLibrary).name);
																								$.append($$anchor, fragment_26);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_25);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_24);
																	},
																	$$slots: { default: true }
																});
															});

															var node_14 = $.sibling(node_9, 2);

															{
																var consequent_6 = ($$anchor) => {
																	var fragment_28 = $.comment();
																	var node_15 = $.first_child(fragment_28);

																	$.component(node_15, () => Picker.Separator, ($$anchor, Picker_Separator) => {
																		Picker_Separator($$anchor, { class: 'opacity-50' });
																	});

																	$.append($$anchor, fragment_28);
																};

																var d = $.derived(() => $.get(index) < Object.values(iconLibraries).length - 1);

																$.if(node_14, ($$render) => {
																	if ($.get(d)) $$render(consequent_6);
																});
															}

															$.append($$anchor, fragment_23);
														});

														$.append($$anchor, fragment_22);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_21);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_20);
							},
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_18);
			},
			$$slots: { default: true }
		});
	});

	var node_16 = $.sibling(node_2, 2);

	LockButton(node_16, {
		prop: 'iconLibrary',
		class: 'absolute top-1/2 right-10 -translate-y-1/2'
	});

	$.reset(div_5);
	$.append($$anchor, div_5);
	$.pop();
}