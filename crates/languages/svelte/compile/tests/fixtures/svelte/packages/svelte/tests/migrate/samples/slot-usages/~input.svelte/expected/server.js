import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Component($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->unchanged`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	if (Component) {
		$$renderer.push('<!--[-->');

		Component($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->unchanged`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	Component($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { foo }) => {
				$$renderer.push(`<div>${$.escape(foo)}</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { foo: bar }) => {
				$$renderer.push(`<div>${$.escape(bar)}</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	if (Component) {
		$$renderer.push('<!--[-->');

		Component($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { foo }) => {
					$$renderer.push(`<div>${$.escape(foo)}</div>`);
				}
			}
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	Component($$renderer, {
		$$slots: {
			named: ($$renderer) => {
				$$renderer.push(`<div slot="named">x</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		$$slots: {
			named: ($$renderer) => {
				$$renderer.push(`<div slot="named"><p>multi</p> <p>line</p></div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		$$slots: {
			named: ($$renderer) => {
				$.element(
					$$renderer,
					'div',
					() => {
						$$renderer.push(` slot="named"`);
					},
					() => {
						$$renderer.push(`x`);
					}
				);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		$$slots: {
			foo: ($$renderer, { foo }) => {
				$$renderer.push(`<div slot="foo">${$.escape(foo)}</div>`);
			},

			bar: ($$renderer, { foo: bar }) => {
				$$renderer.push(`<div slot="bar">${$.escape(bar)}</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { foo }) => {
				$$renderer.push(`<!---->${$.escape(foo)}`);
			},

			named: ($$renderer) => {
				$$renderer.push(`<div slot="named">x</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { foo }) => {
				{
					$$renderer.push(`${$.escape(foo)}`);
				}
			}
		}
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		$$slots: {
			named: ($$renderer, { foo }) => {
				{
					$$renderer.push(`${$.escape(foo)}`);
				}
			}
		}
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->OMG WHY`);
		},

		$$slots: {
			default: true,
			foo: ($$renderer) => {
				$$renderer.push(`<div slot="foo">foo</div>`);
			},

			bar: ($$renderer) => {
				$$renderer.push(`<div slot="bar">bar</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->If you do mix slots like this you're a monster`);
		},

		$$slots: {
			default: true,
			foo: ($$renderer) => {
				$$renderer.push(`<div slot="foo">foo</div>`);
			},

			bar: ($$renderer) => {
				$$renderer.push(`<div slot="bar">bar</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { omg }) => {
				$$renderer.push(`<!---->${$.escape(omg)} WHY`);
			},

			foo: ($$renderer) => {
				$$renderer.push(`<div slot="foo">foo</div>`);
			},

			bar: ($$renderer) => {
				$$renderer.push(`<div slot="bar">bar</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { monster }) => {
				$$renderer.push(`<!---->If you do mix slots like this you're a ${$.escape(monster)}`);
			},

			foo: ($$renderer) => {
				$$renderer.push(`<div slot="foo">foo</div>`);
			},

			bar: ($$renderer) => {
				$$renderer.push(`<div slot="bar">bar</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<span slot="default">should be children</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { with_prop }) => {
				$$renderer.push(`<span slot="default">should be children ${$.escape(with_prop)} too</span>`);
			}
		}
	});

	$$renderer.push(`<!----> <c-e><div slot="named">unchanged</div></c-e>`);
}