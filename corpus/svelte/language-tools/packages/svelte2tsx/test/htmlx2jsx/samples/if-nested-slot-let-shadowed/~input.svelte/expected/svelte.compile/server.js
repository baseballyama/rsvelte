import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (hello && hello1) {
		$$renderer.push('<!--[0-->');

		Comp($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { hello }) => {
					$$renderer.push(`<!---->${$.escape(hello)} `);

					Comp($$renderer, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$renderer, { hello }) => {
								if (hello) {
									$$renderer.push(`<!--[0-->${$.escape(hello)}`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}
						}
					});

					$$renderer.push(`<!----> `);

					Comp($$renderer, {
						hello,
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$renderer, { hello }) => {
								if (hello) {
									$$renderer.push(`<!--[0-->${$.escape(hello)}`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}
						}
					});

					$$renderer.push(`<!---->  `);

					if (hello) {
						$$renderer.push('<!--[0-->');

						Comp($$renderer, {
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$renderer, { hello }) => {
									if (hello) {
										$$renderer.push(`<!--[0-->${$.escape(hello)}`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}
							}
						});

						$$renderer.push(`<!----> `);

						Comp($$renderer, {
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$renderer, { foo }) => {
									const hello = foo;

									if (hello) {
										$$renderer.push(`<!--[0-->${$.escape(hello)}`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}
							}
						});

						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},

				named1: ($$renderer, { hello }) => {
					{
						if (hello) {
							$$renderer.push(`<!--[0-->${$.escape(hello)}`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}
				},

				named2: ($$renderer, { hello }) => {
					$$renderer.push(`<p slot="named2">`);

					if (hello) {
						$$renderer.push(`<!--[0-->${$.escape(hello)}`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></p>`);
				},

				named3: ($$renderer, { hello }) => {
					Comp($$renderer, {
						slot: 'named3',
						children: ($$renderer) => {
							if (hello) {
								$$renderer.push(`<!--[0-->${$.escape(hello)}`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
				}
			}
		});

		$$renderer.push(`<!----> `);

		if (hi && bye) {
			$$renderer.push('<!--[0-->');

			Comp($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { foo: bye }) => {
						$$renderer.push(`<!---->${$.escape(bye)}`);
					}
				}
			});
		} else if (cool) {
			$$renderer.push('<!--[1-->');

			Comp($$renderer, {
				$$slots: {
					named: ($$renderer, { cool, hello }) => {
						$$renderer.push(`<div slot="named">${$.escape(hello)}</div>`);
					}
				}
			});
		} else {
			$$renderer.push('<!--[-1-->');

			Comp($$renderer, {
				$$slots: {
					named: ($$renderer, { foo: hello, hello1: other }) => {
						$$renderer.push(`<div slot="named">${$.escape(hello)}</div>`);
					}
				}
			});
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	Comp($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { hello }) => {
				if (hello && bye) {
					$$renderer.push(`<!--[0-->${$.escape(hello)} ${$.escape(bye)}`);
				} else if (hello && bye) {
					$$renderer.push(`<!--[1-->${$.escape(hello)} ${$.escape(bye)}`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(hello)} ${$.escape(bye)}`);
				}

				$$renderer.push(`<!--]-->`);
			},

			named1: ($$renderer, { hello }) => {
				{
					if (hello && bye) {
						$$renderer.push(`<!--[0-->${$.escape(hello)} ${$.escape(bye)}`);
					} else if (hello && bye) {
						$$renderer.push(`<!--[1-->${$.escape(hello)} ${$.escape(bye)}`);
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(hello)} ${$.escape(bye)}`);
					}

					$$renderer.push(`<!--]-->`);
				}
			},

			named2: ($$renderer, { hello }) => {
				$$renderer.push(`<p slot="named2">`);

				if (hello && bye) {
					$$renderer.push(`<!--[0-->${$.escape(hello)} ${$.escape(bye)}`);
				} else if (hello && bye) {
					$$renderer.push(`<!--[1-->${$.escape(hello)} ${$.escape(bye)}`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(hello)} ${$.escape(bye)}`);
				}

				$$renderer.push(`<!--]--></p>`);
			},

			named3: ($$renderer, { foo }) => {
				const hello = foo;

				$$renderer.push(`<p slot="named3">`);

				if (hello && bye) {
					$$renderer.push(`<!--[0-->${$.escape(hello)} ${$.escape(bye)}`);
				} else if (hello && bye) {
					$$renderer.push(`<!--[1-->${$.escape(hello)} ${$.escape(bye)}`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(hello)} ${$.escape(bye)}`);
				}

				$$renderer.push(`<!--]--></p>`);
			}
		}
	});

	$$renderer.push(`<!---->`);
}