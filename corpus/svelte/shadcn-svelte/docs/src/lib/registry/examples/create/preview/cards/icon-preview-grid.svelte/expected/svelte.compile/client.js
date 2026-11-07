import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";

var root = $.from_html(`<div class="grid grid-cols-8 place-items-center gap-4"></div>`);

export default function Icon_preview_grid($$anchor) {
	const PREVIEW_ICONS = [
		{
			lucide: "CopyIcon",
			tabler: "IconCopy",
			hugeicons: "Copy01Icon",
			phosphor: "CopyIcon",
			remixicon: "RiFileCopyLine"
		},

		{
			lucide: "CircleAlertIcon",
			tabler: "IconExclamationCircle",
			hugeicons: "AlertCircleIcon",
			phosphor: "WarningCircleIcon",
			remixicon: "RiErrorWarningLine"
		},

		{
			lucide: "TrashIcon",
			tabler: "IconTrash",
			hugeicons: "Delete02Icon",
			phosphor: "TrashIcon",
			remixicon: "RiDeleteBinLine"
		},

		{
			lucide: "ShareIcon",
			tabler: "IconShare",
			hugeicons: "Share03Icon",
			phosphor: "ShareIcon",
			remixicon: "RiShareLine"
		},

		{
			lucide: "ShoppingBagIcon",
			tabler: "IconShoppingBag",
			hugeicons: "ShoppingBag01Icon",
			phosphor: "BagIcon",
			remixicon: "RiShoppingBagLine"
		},

		{
			lucide: "MoreHorizontalIcon",
			tabler: "IconDots",
			hugeicons: "MoreHorizontalCircle01Icon",
			phosphor: "DotsThreeIcon",
			remixicon: "RiMoreLine"
		},

		{
			lucide: "Loader2Icon",
			tabler: "IconLoader",
			hugeicons: "Loading03Icon",
			phosphor: "SpinnerIcon",
			remixicon: "RiLoaderLine"
		},

		{
			lucide: "PlusIcon",
			tabler: "IconPlus",
			hugeicons: "PlusSignIcon",
			phosphor: "PlusIcon",
			remixicon: "RiAddLine"
		},

		{
			lucide: "MinusIcon",
			tabler: "IconMinus",
			hugeicons: "MinusSignIcon",
			phosphor: "MinusIcon",
			remixicon: "RiSubtractLine"
		},

		{
			lucide: "ArrowLeftIcon",
			tabler: "IconArrowLeft",
			hugeicons: "ArrowLeft02Icon",
			phosphor: "ArrowLeftIcon",
			remixicon: "RiArrowLeftLine"
		},

		{
			lucide: "ArrowRightIcon",
			tabler: "IconArrowRight",
			hugeicons: "ArrowRight02Icon",
			phosphor: "ArrowRightIcon",
			remixicon: "RiArrowRightLine"
		},

		{
			lucide: "CheckIcon",
			tabler: "IconCheck",
			hugeicons: "Tick02Icon",
			phosphor: "CheckIcon",
			remixicon: "RiCheckLine"
		},

		{
			lucide: "ChevronDownIcon",
			tabler: "IconChevronDown",
			hugeicons: "ArrowDown01Icon",
			phosphor: "CaretDownIcon",
			remixicon: "RiArrowDownSLine"
		},

		{
			lucide: "ChevronRightIcon",
			tabler: "IconChevronRight",
			hugeicons: "ArrowRight01Icon",
			phosphor: "CaretRightIcon",
			remixicon: "RiArrowRightSLine"
		},

		{
			lucide: "SearchIcon",
			tabler: "IconSearch",
			hugeicons: "Search01Icon",
			phosphor: "MagnifyingGlassIcon",
			remixicon: "RiSearchLine"
		},

		{
			lucide: "SettingsIcon",
			tabler: "IconSettings",
			hugeicons: "Settings01Icon",
			phosphor: "GearIcon",
			remixicon: "RiSettingsLine"
		}
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div = root();

							$.each(div, 21, () => PREVIEW_ICONS, $.index, ($$anchor, icon) => {
								var fragment_2 = $.comment();
								var node_2 = $.first_child(fragment_2);

								$.component(node_2, () => Card.Root, ($$anchor, Card_Root_1) => {
									Card_Root_1($$anchor, {
										class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
										children: ($$anchor, $$slotProps) => {
											IconPlaceholder($$anchor, {
												get lucide() {
													return $.get(icon).lucide;
												},

												get tabler() {
													return $.get(icon).tabler;
												},

												get hugeicons() {
													return $.get(icon).hugeicons;
												},

												get phosphor() {
													return $.get(icon).phosphor;
												},

												get remixicon() {
													return $.get(icon).remixicon;
												}
											});
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							});

							$.reset(div);
							$.append($$anchor, div);
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