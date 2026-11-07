import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ActivateAgentDialog from "./activate-agent-dialog.svelte";
import AnalyticsCard from "./analytics-card.svelte";
import AnomalyAlert from "./anomaly-alert.svelte";
import BillingList from "./billing-list.svelte";
import DeploymentFilter from "./deployment-filter.svelte";
import FeedbackForm from "./feedback-form.svelte";
import ObservabilityCard from "./observability-card.svelte";
import UsageCard from "./usage-card.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Vercel($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			DeploymentFilter(node, {});

			var node_1 = $.sibling(node, 2);

			UsageCard(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			ObservabilityCard(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			BillingList(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			AnomalyAlert(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			ActivateAgentDialog(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			FeedbackForm(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			AnalyticsCard(node_7, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}