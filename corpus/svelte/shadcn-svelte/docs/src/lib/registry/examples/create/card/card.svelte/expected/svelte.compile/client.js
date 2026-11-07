import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CardDefault from "./card-default.svelte";
import CardFooterWithBorderSmall from "./card-footer-with-border-small.svelte";
import CardFooterWithBorder from "./card-footer-with-border.svelte";
import CardHeaderWithBorderSmall from "./card-header-with-border-small.svelte";
import CardHeaderWithBorder from "./card-header-with-border.svelte";
import CardLogin from "./card-login.svelte";
import CardMeetingNotes from "./card-meeting-notes.svelte";
import CardSmall from "./card-small.svelte";
import CardWithImageSmall from "./card-with-image-small.svelte";
import CardWithImage from "./card-with-image.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Card($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			CardDefault(node, {});

			var node_1 = $.sibling(node, 2);

			CardSmall(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			CardHeaderWithBorder(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			CardFooterWithBorder(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			CardHeaderWithBorderSmall(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			CardFooterWithBorderSmall(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			CardWithImage(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			CardWithImageSmall(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			CardLogin(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			CardMeetingNotes(node_9, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}