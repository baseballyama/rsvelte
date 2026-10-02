import * as $ from 'svelte/internal/server';
import SquareIcon from "@lucide/svelte/icons/square";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import HugeiconsIcon from "./hugeicons-icon.svelte";
import LucideIcon from "./lucide-icon.svelte";
import PhosphorIcon from "./phosphor-icon.svelte";
import RemixiconIcon from "./remixicon-icon.svelte";
import TablerIcon from "./tabler-icon.svelte";

export default function Icon_placeholder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			hugeicons,
			lucide,
			tabler,
			phosphor,
			remixicon,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const designSystem = useDesignSystem();

		function PlaceholderIcon($$renderer) {
			SquareIcon($$renderer, $.spread_props([{ class: className }, restProps]));
		}

		if (designSystem.iconLibrary === "hugeicons") {
			$$renderer.push('<!--[0-->');

			{
				function placeholder($$renderer) {
					PlaceholderIcon($$renderer);
				}

				HugeiconsIcon($$renderer, $.spread_props([
					{ icon: hugeicons, className },
					restProps,
					{ placeholder, $$slots: { placeholder: true } }
				]));
			}
		} else if (designSystem.iconLibrary === "lucide") {
			$$renderer.push('<!--[1-->');

			{
				function placeholder($$renderer) {
					PlaceholderIcon($$renderer);
				}

				LucideIcon($$renderer, $.spread_props([
					{ icon: lucide, class: className },
					restProps,
					{ placeholder, $$slots: { placeholder: true } }
				]));
			}
		} else if (designSystem.iconLibrary === "tabler") {
			$$renderer.push('<!--[2-->');

			{
				function placeholder($$renderer) {
					PlaceholderIcon($$renderer);
				}

				TablerIcon($$renderer, $.spread_props([
					{ icon: tabler, class: className },
					restProps,
					{ placeholder, $$slots: { placeholder: true } }
				]));
			}
		} else if (designSystem.iconLibrary === "phosphor") {
			$$renderer.push('<!--[3-->');

			{
				function placeholder($$renderer) {
					PlaceholderIcon($$renderer);
				}

				PhosphorIcon($$renderer, $.spread_props([
					{ icon: phosphor, class: className },
					restProps,
					{ placeholder, $$slots: { placeholder: true } }
				]));
			}
		} else if (designSystem.iconLibrary === "remixicon") {
			$$renderer.push('<!--[4-->');

			{
				function placeholder($$renderer) {
					PlaceholderIcon($$renderer);
				}

				RemixiconIcon($$renderer, $.spread_props([
					{ icon: remixicon, class: className },
					restProps,
					{ placeholder, $$slots: { placeholder: true } }
				]));
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}