import * as $ from 'svelte/internal/server';
import CarouselBasic from "./carousel-basic.svelte";
import CarouselMultiple from "./carousel-multiple.svelte";
import CarouselWithGap from "./carousel-with-gap.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Carousel($$renderer) {
	ExampleWrapper($$renderer, {
		class: 'lg:grid-cols-1',
		children: ($$renderer) => {
			CarouselBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			CarouselMultiple($$renderer, {});
			$$renderer.push(`<!----> `);
			CarouselWithGap($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}