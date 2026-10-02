import * as $ from 'svelte/internal/server';
import ActivateAgentDialog from "./activate-agent-dialog.svelte";
import AnalyticsCard from "./analytics-card.svelte";
import AnomalyAlert from "./anomaly-alert.svelte";
import BillingList from "./billing-list.svelte";
import DeploymentFilter from "./deployment-filter.svelte";
import FeedbackForm from "./feedback-form.svelte";
import ObservabilityCard from "./observability-card.svelte";
import UsageCard from "./usage-card.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Vercel($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			DeploymentFilter($$renderer, {});
			$$renderer.push(`<!----> `);
			UsageCard($$renderer, {});
			$$renderer.push(`<!----> `);
			ObservabilityCard($$renderer, {});
			$$renderer.push(`<!----> `);
			BillingList($$renderer, {});
			$$renderer.push(`<!----> `);
			AnomalyAlert($$renderer, {});
			$$renderer.push(`<!----> `);
			ActivateAgentDialog($$renderer, {});
			$$renderer.push(`<!----> `);
			FeedbackForm($$renderer, {});
			$$renderer.push(`<!----> `);
			AnalyticsCard($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}