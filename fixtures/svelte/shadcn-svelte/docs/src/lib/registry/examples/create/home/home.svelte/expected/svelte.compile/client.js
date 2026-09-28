import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Home($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ObservabilityCard(node, {});

			var node_1 = $.sibling(node, 2);

			SmallFormExample(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			FormExample(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			FieldExamples(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			ItemExample(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			ButtonGroupExamples(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			EmptyAvatarGroup(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			InputGroupExamples(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			SheetExample(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			BadgeExamples(node_9, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}