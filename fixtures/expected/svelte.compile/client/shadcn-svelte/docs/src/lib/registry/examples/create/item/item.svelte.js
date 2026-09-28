import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ItemAsChild from "./item-as-child.svelte";
import ItemFooter from "./item-footer.svelte";
import ItemGroup from "./item-group.svelte";
import ItemHeaderAndFooter from "./item-header-and-footer.svelte";
import ItemHeader from "./item-header.svelte";
import ItemMutedGroup from "./item-muted-group.svelte";
import ItemMutedImage from "./item-muted-image.svelte";
import ItemMutedLink from "./item-muted-link.svelte";
import ItemOutlineGroup from "./item-outline-group.svelte";
import ItemOutlineImageExtraSmall from "./item-outline-image-extra-small.svelte";
import ItemOutlineImageSmall from "./item-outline-image-small.svelte";
import ItemOutlineImage from "./item-outline-image.svelte";
import ItemOutlineLink from "./item-outline-link.svelte";
import ItemSeparator from "./item-separator.svelte";
import ItemVariants from "./item-variants.svelte";
import ItemWithImage from "./item-with-image.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Item($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ItemVariants(node, {});

			var node_1 = $.sibling(node, 2);

			ItemAsChild(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			ItemOutlineLink(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			ItemMutedLink(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			ItemGroup(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			ItemOutlineGroup(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			ItemMutedGroup(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			ItemSeparator(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			ItemHeader(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			ItemFooter(node_9, {});

			var node_10 = $.sibling(node_9, 2);

			ItemHeaderAndFooter(node_10, {});

			var node_11 = $.sibling(node_10, 2);

			ItemWithImage(node_11, {});

			var node_12 = $.sibling(node_11, 2);

			ItemOutlineImage(node_12, {});

			var node_13 = $.sibling(node_12, 2);

			ItemOutlineImageSmall(node_13, {});

			var node_14 = $.sibling(node_13, 2);

			ItemOutlineImageExtraSmall(node_14, {});

			var node_15 = $.sibling(node_14, 2);

			ItemMutedImage(node_15, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}