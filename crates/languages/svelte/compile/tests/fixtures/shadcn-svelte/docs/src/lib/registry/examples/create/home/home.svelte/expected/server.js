import * as $ from 'svelte/internal/server';
import BadgeExamples from "./badge-examples.svelte";
import ButtonGroupExamples from "./button-group-examples.svelte";
import EmptyAvatarGroup from "./empty-avatar-group.svelte";
import FieldExamples from "./field-examples.svelte";
import FormExample from "./form-example.svelte";
import InputGroupExamples from "./input-group-examples.svelte";
import ItemExample from "./item-example.svelte";
import ObservabilityCard from "./observability-card.svelte";
import SheetExample from "./sheet-example.svelte";
import SmallFormExample from "./small-form-example.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Home($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			ObservabilityCard($$renderer, {});
			$$renderer.push(`<!----> `);
			SmallFormExample($$renderer, {});
			$$renderer.push(`<!----> `);
			FormExample($$renderer, {});
			$$renderer.push(`<!----> `);
			FieldExamples($$renderer, {});
			$$renderer.push(`<!----> `);
			ItemExample($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonGroupExamples($$renderer, {});
			$$renderer.push(`<!----> `);
			EmptyAvatarGroup($$renderer, {});
			$$renderer.push(`<!----> `);
			InputGroupExamples($$renderer, {});
			$$renderer.push(`<!----> `);
			SheetExample($$renderer, {});
			$$renderer.push(`<!----> `);
			BadgeExamples($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}