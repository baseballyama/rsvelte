import * as $ from 'svelte/internal/server';
import SliderBasic from "./slider-basic.svelte";
import SliderControlled from "./slider-controlled.svelte";
import SliderDisabled from "./slider-disabled.svelte";
import SliderMultiple from "./slider-multiple.svelte";
import SliderRange from "./slider-range.svelte";
import SliderVertical from "./slider-vertical.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Slider($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			SliderBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			SliderRange($$renderer, {});
			$$renderer.push(`<!----> `);
			SliderMultiple($$renderer, {});
			$$renderer.push(`<!----> `);
			SliderVertical($$renderer, {});
			$$renderer.push(`<!----> `);
			SliderControlled($$renderer, {});
			$$renderer.push(`<!----> `);
			SliderDisabled($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}