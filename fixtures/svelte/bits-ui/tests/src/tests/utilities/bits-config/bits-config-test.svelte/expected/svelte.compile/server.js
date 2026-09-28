import * as $ from 'svelte/internal/server';
import { BitsConfig, getBitsConfig } from "bits-ui";

export default function Bits_config_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function ConfigDisplay() {
			const config = getBitsConfig();
			const portalTo = config.defaultPortalTo?.current;
			const locale = config.defaultLocale?.current;

			return {
				portalTo: portalTo ?? "undefined",
				locale: locale ?? "undefined"
			};
		}

		const noConfigResult = ConfigDisplay();

		$$renderer.push(`<div data-testid="no-config"><span data-testid="no-config-portal">${$.escape(noConfigResult.portalTo)}</span> <span data-testid="no-config-locale">${$.escape(noConfigResult.locale)}</span></div> `);

		BitsConfig($$renderer, {
			defaultPortalTo: '#root-portal',
			defaultLocale: 'en',
			children: ($$renderer) => {
				const result = ConfigDisplay();

				$$renderer.push(`<div data-testid="root-config"><span data-testid="root-config-portal">${$.escape(result.portalTo)}</span> <span data-testid="root-config-locale">${$.escape(result.locale)}</span></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		BitsConfig($$renderer, {
			defaultPortalTo: '#parent-portal',
			defaultLocale: 'en',
			children: ($$renderer) => {
				BitsConfig($$renderer, {
					children: ($$renderer) => {
						const result = ConfigDisplay();

						$$renderer.push(`<div data-testid="child-inherits"><span data-testid="child-inherits-portal">${$.escape(result.portalTo)}</span> <span data-testid="child-inherits-locale">${$.escape(result.locale)}</span></div>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		BitsConfig($$renderer, {
			defaultPortalTo: '#parent-portal',
			defaultLocale: 'en',
			children: ($$renderer) => {
				BitsConfig($$renderer, {
					defaultPortalTo: '#child-portal',
					children: ($$renderer) => {
						const result = ConfigDisplay();

						$$renderer.push(`<div data-testid="child-overrides"><span data-testid="child-overrides-portal">${$.escape(result.portalTo)}</span> <span data-testid="child-overrides-locale">${$.escape(result.locale)}</span></div>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		BitsConfig($$renderer, {
			defaultPortalTo: '#level1',
			defaultLocale: 'en',
			children: ($$renderer) => {
				BitsConfig($$renderer, {
					defaultLocale: 'es',
					children: ($$renderer) => {
						BitsConfig($$renderer, {
							children: ($$renderer) => {
								const result = ConfigDisplay();

								$$renderer.push(`<div data-testid="deep-nesting"><span data-testid="deep-nesting-portal">${$.escape(result.portalTo)}</span> <span data-testid="deep-nesting-locale">${$.escape(result.locale)}</span></div>`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		BitsConfig($$renderer, {
			defaultPortalTo: '#base',
			defaultLocale: 'en',
			children: ($$renderer) => {
				BitsConfig($$renderer, {
					defaultLocale: 'fr',
					children: ($$renderer) => {
						BitsConfig($$renderer, {
							defaultPortalTo: '#override',
							children: ($$renderer) => {
								const result = ConfigDisplay();

								$$renderer.push(`<div data-testid="partial-override"><span data-testid="partial-override-portal">${$.escape(result.portalTo)}</span> <span data-testid="partial-override-locale">${$.escape(result.locale)}</span></div>`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}