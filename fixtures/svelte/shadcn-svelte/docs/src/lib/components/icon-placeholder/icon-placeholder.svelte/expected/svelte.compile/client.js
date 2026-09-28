import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SquareIcon from "@lucide/svelte/icons/square";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import HugeiconsIcon from "./hugeicons-icon.svelte";
import LucideIcon from "./lucide-icon.svelte";
import PhosphorIcon from "./phosphor-icon.svelte";
import RemixiconIcon from "./remixicon-icon.svelte";
import TablerIcon from "./tabler-icon.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'hugeicons',
	'lucide',
	'tabler',
	'phosphor',
	'remixicon',
	'class'
]);

export default function Icon_placeholder($$anchor, $$props) {
	$.push($$props, true);

	const PlaceholderIcon = ($$anchor) => {
		SquareIcon($$anchor, $.spread_props(
			{
				get class() {
					return $$props.class;
				}
			},
			() => restProps
		));
	};

	let restProps = $.rest_props($$props, rest_excludes);
	const designSystem = useDesignSystem();
	var fragment_1 = $.comment();
	var node = $.first_child(fragment_1);

	{
		var consequent = ($$anchor) => {
			{
				const placeholder = ($$anchor) => {
					PlaceholderIcon($$anchor);
				};

				HugeiconsIcon($$anchor, $.spread_props(
					{
						get icon() {
							return $$props.hugeicons;
						},

						get className() {
							return $$props.class;
						}
					},
					() => restProps,
					{ placeholder, $$slots: { placeholder: true } }
				));
			}
		};

		var consequent_1 = ($$anchor) => {
			{
				const placeholder = ($$anchor) => {
					PlaceholderIcon($$anchor);
				};

				LucideIcon($$anchor, $.spread_props(
					{
						get icon() {
							return $$props.lucide;
						},

						get class() {
							return $$props.class;
						}
					},
					() => restProps,
					{ placeholder, $$slots: { placeholder: true } }
				));
			}
		};

		var consequent_2 = ($$anchor) => {
			{
				const placeholder = ($$anchor) => {
					PlaceholderIcon($$anchor);
				};

				TablerIcon($$anchor, $.spread_props(
					{
						get icon() {
							return $$props.tabler;
						},

						get class() {
							return $$props.class;
						}
					},
					() => restProps,
					{ placeholder, $$slots: { placeholder: true } }
				));
			}
		};

		var consequent_3 = ($$anchor) => {
			{
				const placeholder = ($$anchor) => {
					PlaceholderIcon($$anchor);
				};

				PhosphorIcon($$anchor, $.spread_props(
					{
						get icon() {
							return $$props.phosphor;
						},

						get class() {
							return $$props.class;
						}
					},
					() => restProps,
					{ placeholder, $$slots: { placeholder: true } }
				));
			}
		};

		var consequent_4 = ($$anchor) => {
			{
				const placeholder = ($$anchor) => {
					PlaceholderIcon($$anchor);
				};

				RemixiconIcon($$anchor, $.spread_props(
					{
						get icon() {
							return $$props.remixicon;
						},

						get class() {
							return $$props.class;
						}
					},
					() => restProps,
					{ placeholder, $$slots: { placeholder: true } }
				));
			}
		};

		$.if(node, ($$render) => {
			if (designSystem.iconLibrary === "hugeicons") $$render(consequent); else if (designSystem.iconLibrary === "lucide") $$render(consequent_1, 1); else if (designSystem.iconLibrary === "tabler") $$render(consequent_2, 2); else if (designSystem.iconLibrary === "phosphor") $$render(consequent_3, 3); else if (designSystem.iconLibrary === "remixicon") $$render(consequent_4, 4);
		});
	}

	$.append($$anchor, fragment_1);
	$.pop();
}