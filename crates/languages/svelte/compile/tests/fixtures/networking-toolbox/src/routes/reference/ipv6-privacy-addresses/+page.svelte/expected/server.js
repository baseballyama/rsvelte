import * as $ from 'svelte/internal/server';
import { ipv6PrivacyContent } from '$lib/content/ipv6-privacy-addresses.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(ipv6PrivacyContent.title)}</h1> <p class="subtitle">${$.escape(ipv6PrivacyContent.description)}</p></div> <div class="ref-section"><h2>${$.escape(ipv6PrivacyContent.sections.overview.title)}</h2> <p>${$.escape(ipv6PrivacyContent.sections.overview.content)}</p></div> <div class="ref-section"><h2>${$.escape(ipv6PrivacyContent.sections.problem.title)}</h2> <p>${$.escape(ipv6PrivacyContent.sections.problem.content)}</p></div> <div class="ref-section"><h2>IPv6 Address Types</h2> <!--[-->`);

		const each_array = $.ensure_array_like(ipv6PrivacyContent.addressTypes);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let type = each_array[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(type.type)}</div> <div class="example-item"><div><strong>Formation:</strong> ${$.escape(type.formation)}</div> <div><strong>Example:</strong> <code>${$.escape(type.example)}</code></div> <div><strong>Privacy Level:</strong> ${$.escape(type.privacy)}</div> <h4>Characteristics:</h4> <ul><!--[-->`);

			const each_array_1 = $.ensure_array_like(type.characteristics);

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let characteristic = each_array_1[index];

				$$renderer.push(`<li>${$.escape(characteristic)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>${$.escape(ipv6PrivacyContent.howItWorks.title)}</h2> <h3>Address Generation Process</h3> <ol><!--[-->`);

		const each_array_2 = $.ensure_array_like(ipv6PrivacyContent.howItWorks.addressGeneration);

		for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
			let step = each_array_2[index];

			$$renderer.push(`<li>${$.escape(step)}</li>`);
		}

		$$renderer.push(`<!--]--></ol> <h3>Temporary Address Lifecycle</h3> <ol><!--[-->`);

		const each_array_3 = $.ensure_array_like(ipv6PrivacyContent.howItWorks.temporaryLifecycle);

		for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
			let step = each_array_3[index];

			$$renderer.push(`<li>${$.escape(step)}</li>`);
		}

		$$renderer.push(`<!--]--></ol> <h3>Default Operating System Behavior</h3> <ul><!--[-->`);

		const each_array_4 = $.ensure_array_like(ipv6PrivacyContent.howItWorks.defaultBehavior);

		for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
			let behavior = each_array_4[index];

			$$renderer.push(`<li>${$.escape(behavior)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>${$.escape(ipv6PrivacyContent.lifetimes.title)}</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Preferred Lifetime</div> <div class="item-description">${$.escape(ipv6PrivacyContent.lifetimes.preferredLifetime.description)}</div> <div><strong>Typical:</strong> ${$.escape(ipv6PrivacyContent.lifetimes.preferredLifetime.typical)}</div> <div><strong>Behavior:</strong> ${$.escape(ipv6PrivacyContent.lifetimes.preferredLifetime.behavior)}</div></div> <div class="grid-item"><div class="item-title">Valid Lifetime</div> <div class="item-description">${$.escape(ipv6PrivacyContent.lifetimes.validLifetime.description)}</div> <div><strong>Typical:</strong> ${$.escape(ipv6PrivacyContent.lifetimes.validLifetime.typical)}</div> <div><strong>Behavior:</strong> ${$.escape(ipv6PrivacyContent.lifetimes.validLifetime.behavior)}</div></div> <div class="grid-item"><div class="item-title">Regeneration Interval</div> <div class="item-description">${$.escape(ipv6PrivacyContent.lifetimes.regenerationInterval.description)}</div> <div><strong>Typical:</strong> ${$.escape(ipv6PrivacyContent.lifetimes.regenerationInterval.typical)}</div> <div><strong>Behavior:</strong> ${$.escape(ipv6PrivacyContent.lifetimes.regenerationInterval.behavior)}</div></div> <div class="grid-item"><div class="item-title">Max Temporary Addresses</div> <div class="item-description">${$.escape(ipv6PrivacyContent.lifetimes.maxTempAddresses.description)}</div> <div><strong>Typical:</strong> ${$.escape(ipv6PrivacyContent.lifetimes.maxTempAddresses.typical)}</div> <div><strong>Behavior:</strong> ${$.escape(ipv6PrivacyContent.lifetimes.maxTempAddresses.behavior)}</div></div></div></div> <div class="ref-section"><h2>${$.escape(ipv6PrivacyContent.osImplementations.title)}</h2> <!--[-->`);

		const each_array_5 = $.ensure_array_like(Object.entries(ipv6PrivacyContent.osImplementations));

		for (let $$index_8 = 0, $$length = each_array_5.length; $$index_8 < $$length; $$index_8++) {
			let [key, os] = each_array_5[$$index_8];

			if (typeof os === 'object' && os.os) {
				$$renderer.push(`<!--[0--><div class="ref-examples"><div class="examples-title">${$.escape(os.os)}</div> <div class="example-item"><div><strong>Default Behavior:</strong> ${$.escape(os.defaultBehavior)}</div> <h4>Configuration:</h4> <!--[-->`);

				const each_array_6 = $.ensure_array_like(os.configuration);

				for (let index = 0, $$length = each_array_6.length; index < $$length; index++) {
					let config = each_array_6[index];

					$$renderer.push(`<code class="example-input">${$.escape(config)}</code>`);
				}

				$$renderer.push(`<!--]--> `);

				if (os.values) {
					$$renderer.push(`<!--[0--><h4>Values:</h4> <ul><!--[-->`);

					const each_array_7 = $.ensure_array_like(os.values);

					for (let index = 0, $$length = each_array_7.length; index < $$length; index++) {
						let value = each_array_7[index];

						$$renderer.push(`<li><code>${$.escape(value)}</code></li>`);
					}

					$$renderer.push(`<!--]--></ul>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <h4>Useful Commands:</h4> <!--[-->`);

				const each_array_8 = $.ensure_array_like(os.commands);

				for (let index = 0, $$length = each_array_8.length; index < $$length; index++) {
					let command = each_array_8[index];

					$$renderer.push(`<code class="example-input">${$.escape(command)}</code>`);
				}

				$$renderer.push(`<!--]--> `);

				if (os.behavior) {
					$$renderer.push(`<!--[0--><div><strong>Behavior:</strong> ${$.escape(os.behavior)}</div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Identifying Address Types</h2> <table class="ref-table"><thead><tr><th>Method</th><th>Stable Address</th><th>Temporary Address</th><th>Example</th></tr></thead><tbody><!--[-->`);

		const each_array_9 = $.ensure_array_like(ipv6PrivacyContent.identifyingAddresses);

		for (let index = 0, $$length = each_array_9.length; index < $$length; index++) {
			let method = each_array_9[index];

			$$renderer.push(`<tr><td><strong>${$.escape(method.method)}</strong></td><td>${$.escape(method.stable)}</td><td>${$.escape(method.temporary)}</td><td>${$.escape(method.example)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>Troubleshooting</h2> <!--[-->`);

		const each_array_10 = $.ensure_array_like(ipv6PrivacyContent.troubleshooting);

		for (let index = 0, $$length = each_array_10.length; index < $$length; index++) {
			let issue = each_array_10[index];

			$$renderer.push(`<div class="ref-warning"><div class="warning-title">`);
			Icon($$renderer, { name: 'help-circle', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(issue.issue)}</div> <div class="warning-content"><p><strong>Symptoms:</strong> ${$.escape(issue.symptoms.join(', '))}</p> <p><strong>Diagnosis:</strong> ${$.escape(issue.diagnosis)}</p> <div><strong>Solutions:</strong></div> <ul><!--[-->`);

			const each_array_11 = $.ensure_array_like(issue.solutions);

			for (let index = 0, $$length = each_array_11.length; index < $$length; index++) {
				let solution = each_array_11[index];

				$$renderer.push(`<li>${$.escape(solution)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Security Considerations</h2> <!--[-->`);

		const each_array_12 = $.ensure_array_like(ipv6PrivacyContent.securityConsiderations);

		for (let index = 0, $$length = each_array_12.length; index < $$length; index++) {
			let security = each_array_12[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(security.aspect)}</div> <div class="example-item"><h4>Benefits:</h4> <ul><!--[-->`);

			const each_array_13 = $.ensure_array_like(security.benefits);

			for (let index = 0, $$length = each_array_13.length; index < $$length; index++) {
				let benefit = each_array_13[index];

				$$renderer.push(`<li>${$.escape(benefit)}</li>`);
			}

			$$renderer.push(`<!--]--></ul> <h4>${$.escape(security.limitations ? 'Limitations' : 'Challenges')}:</h4> <ul><!--[-->`);

			const each_array_14 = $.ensure_array_like(security.limitations || security.challenges);

			for (let index = 0, $$length = each_array_14.length; index < $$length; index++) {
				let item = each_array_14[index];

				$$renderer.push(`<li>${$.escape(item)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>When to Use Privacy Addresses</h2> <!--[-->`);

		const each_array_15 = $.ensure_array_like(ipv6PrivacyContent.whenToUse);

		for (let index = 0, $$length = each_array_15.length; index < $$length; index++) {
			let scenario = each_array_15[index];

			$$renderer.push(`<div class="ref-examples"><div class="examples-title">${$.escape(scenario.scenario)}</div> <div class="example-item"><div><strong>Recommendation:</strong> ${$.escape(scenario.recommendation)}</div> <div><strong>Reasoning:</strong> ${$.escape(scenario.reasoning)}</div> <div><strong>Configuration:</strong> ${$.escape(scenario.configuration)}</div></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-section"><h2>Best Practices</h2> <ul><!--[-->`);

		const each_array_16 = $.ensure_array_like(ipv6PrivacyContent.bestPractices);

		for (let index = 0, $$length = each_array_16.length; index < $$length; index++) {
			let practice = each_array_16[index];

			$$renderer.push(`<li>${$.escape(practice)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>Common Mistakes</h2> <ul><!--[-->`);

		const each_array_17 = $.ensure_array_like(ipv6PrivacyContent.commonMistakes);

		for (let index = 0, $$length = each_array_17.length; index < $$length; index++) {
			let mistake = each_array_17[index];

			$$renderer.push(`<li>${$.escape(mistake)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="ref-section"><h2>Quick Reference</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Address Types</div> <!--[-->`);

		const each_array_18 = $.ensure_array_like(ipv6PrivacyContent.quickReference.addressTypes);

		for (let index = 0, $$length = each_array_18.length; index < $$length; index++) {
			let type = each_array_18[index];

			$$renderer.push(`<div class="item-description">${$.escape(type)}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="grid-item"><div class="item-title">Identification</div> <!--[-->`);

		const each_array_19 = $.ensure_array_like(ipv6PrivacyContent.quickReference.identification);

		for (let index = 0, $$length = each_array_19.length; index < $$length; index++) {
			let tip = each_array_19[index];

			$$renderer.push(`<div class="item-description">${$.escape(tip)}</div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Configuration</div> <!--[-->`);

		const each_array_20 = $.ensure_array_like(ipv6PrivacyContent.quickReference.configuration);

		for (let index = 0, $$length = each_array_20.length; index < $$length; index++) {
			let config = each_array_20[index];

			$$renderer.push(`<div class="item-code">${$.escape(config)}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="grid-item"><div class="item-title">Troubleshooting</div> <!--[-->`);

		const each_array_21 = $.ensure_array_like(ipv6PrivacyContent.quickReference.troubleshooting);

		for (let index = 0, $$length = each_array_21.length; index < $$length; index++) {
			let tip = each_array_21[index];

			$$renderer.push(`<div class="item-description">${$.escape(tip)}</div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="ref-highlight"><div class="highlight-title">`);
		Icon($$renderer, { name: 'key', size: 'sm' });

		$$renderer.push(`<!----> Key Point</div> <div class="highlight-content">Privacy extensions create multiple IPv6 addresses per interface. Temporary addresses change periodically for
          privacy, while stable addresses remain consistent for services. Both can coexist on the same interface.</div></div></div> <div class="ref-section"><h2>Useful Tools</h2> <div class="ref-grid two-col"><!--[-->`);

		const each_array_22 = $.ensure_array_like(ipv6PrivacyContent.tools);

		for (let index = 0, $$length = each_array_22.length; index < $$length; index++) {
			let tool = each_array_22[index];

			$$renderer.push(`<div class="grid-item"><div class="item-title">${$.escape(tool.tool)}</div> <div class="item-description">${$.escape(tool.purpose)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div></div>`);
	});
}