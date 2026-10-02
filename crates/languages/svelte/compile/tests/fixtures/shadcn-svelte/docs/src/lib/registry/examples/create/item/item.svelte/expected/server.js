import * as $ from 'svelte/internal/server';
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

export default function Item($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			ItemVariants($$renderer, {});
			$$renderer.push(`<!----> `);
			ItemAsChild($$renderer, {});
			$$renderer.push(`<!----> `);
			ItemOutlineLink($$renderer, {});
			$$renderer.push(`<!----> `);
			ItemMutedLink($$renderer, {});
			$$renderer.push(`<!----> `);
			ItemGroup($$renderer, {});
			$$renderer.push(`<!----> `);
			ItemOutlineGroup($$renderer, {});
			$$renderer.push(`<!----> `);
			ItemMutedGroup($$renderer, {});
			$$renderer.push(`<!----> `);
			ItemSeparator($$renderer, {});
			$$renderer.push(`<!----> `);
			ItemHeader($$renderer, {});
			$$renderer.push(`<!----> `);
			ItemFooter($$renderer, {});
			$$renderer.push(`<!----> `);
			ItemHeaderAndFooter($$renderer, {});
			$$renderer.push(`<!----> `);
			ItemWithImage($$renderer, {});
			$$renderer.push(`<!----> `);
			ItemOutlineImage($$renderer, {});
			$$renderer.push(`<!----> `);
			ItemOutlineImageSmall($$renderer, {});
			$$renderer.push(`<!----> `);
			ItemOutlineImageExtraSmall($$renderer, {});
			$$renderer.push(`<!----> `);
			ItemMutedImage($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}