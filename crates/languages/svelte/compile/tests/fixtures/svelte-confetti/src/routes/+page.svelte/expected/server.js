import * as $ from 'svelte/internal/server';
import Confetti from "$lib/Confetti.svelte";
import ToggleConfetti from "./ToggleConfetti.svelte";
import ConfettiOnClick from "./ConfettiOnClick.svelte";
import CodeBlock from "./CodeBlock.svelte";

export default function _page($$renderer) {
	$$renderer.push(`<div class="wrapper svelte-1uha8ag"><div class="header svelte-1uha8ag"><h1 class="svelte-1uha8ag">`);

	Confetti($$renderer, {
		infinite: true,
		amount: 10,
		x: [-0.5, -0.25],
		y: [0.25, 0.5],
		delay: [500, 2000],
		colorArray: ["var(--primary)"]
	});

	$$renderer.push(`<!----> <mark class="svelte-1uha8ag">Svelte</mark> Confetti `);

	Confetti($$renderer, {
		infinite: true,
		amount: 10,
		x: [0.25, 0.5],
		y: [0.25, 0.5],
		delay: [500, 2000],
		colorArray: ["white"]
	});

	$$renderer.push(`<!----></h1></div> <div class="block svelte-1uha8ag"><p class="svelte-1uha8ag">Add a little bit of flair to your app with some confetti 🎊! There are no dependencies and it's tiny in size. Even better; it works without JavaScript with the help of SSR in SvelteKit <em>(this page doesn't use SSR though)</em>!</p> <p class="svelte-1uha8ag"><a target="_blank" href="https://github.com/Mitcheljager/svelte-confetti" class="svelte-1uha8ag">GitHub</a> | <a target="_blank" href="https://svelte.dev/repl/21a63990161c481d97483c1f1d4de597" class="svelte-1uha8ag">REPL</a></p> <h2 class="svelte-1uha8ag">Demo</h2> <p class="svelte-1uha8ag">Click these buttons to see their effect. Most of these are not just a single toggle, they are a combination of multiple props. Don't worry we'll go over each one in the documentation further down the page!</p> <div class="buttons svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, {});
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Default</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { amount: 200 });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Lots</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { amount: 10 });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Few</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { size: 20 });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Large</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { rounded: true, size: 15 });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Rounded</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { colorArray: ["var(--primary)"] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Colored</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { colorArray: ["var(--primary)", "white", "green"] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Multi Colored</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, {
				size: 20,
				colorArray: [
					"url(https://svelte.dev/favicon.png)",
					"url(https://github.githubassets.com/favicons/favicon-dark.png)"
				]
			});
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Images</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, {
				size: 20,
				colorArray: ["linear-gradient(#c8102e, white, #003da5)"]
			});
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Gradient</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { y: [1.25, 1.5], x: [-1, 1], colorArray: ["#c8102e"] });
			$$renderer.push(`<!----> `);
			Confetti($$renderer, { y: [1, 1.25], x: [-1, 1], colorArray: ["white"] });
			$$renderer.push(`<!----> `);
			Confetti($$renderer, { y: [0.75, 1], x: [-1, 1], colorArray: ["#003da5"] });
			$$renderer.push(`<!---->`);
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Flag</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { y: [1, 2], x: [-0.25, 0.25] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Vertical</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { y: [0.25, 0.5], x: [-4, 4] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Horizontal</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { cone: true });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Cone</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { y: [-0.5, 0.5], x: [-0.5, 0.5] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">All around</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { y: [-1, 1], x: [-1, 1], noGravity: true, duration: 750 });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Explosion</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, {
				y: [-0.5, 0.5],
				x: [-0.5, 0.5],
				colorRange: [30, 50],
				amount: 20,
				fallDistance: '0px',
				duration: 3000,
				size: 4
			});
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Sparkles</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { delay: [0, 750] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Spray</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { cone: true, x: [-0.5, 0.5] });
			$$renderer.push(`<!----> `);
			Confetti($$renderer, { cone: true, amount: 10, x: [-1, -0.4], y: [0.25, 0.75] });
			$$renderer.push(`<!----> `);
			Confetti($$renderer, { cone: true, amount: 10, x: [0.4, 1], y: [0.25, 0.75] });
			$$renderer.push(`<!---->`);
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Feathered</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		toggleOnce: true,
		children: ($$renderer) => {
			Confetti($$renderer, { infinite: true, amount: 20, delay: [0, 500] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Constant</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	ToggleConfetti($$renderer, {
		toggleOnce: true,
		relative: false,
		children: ($$renderer) => {
			$$renderer.push(`<div style="position: fixed; top: -50px; left: 0; height: 100vh; width: 100vw; display: flex; justify-content: center; overflow: hidden; pointer-events: none;">`);

			Confetti($$renderer, {
				x: [-5, 5],
				y: [0, 0.1],
				delay: [500, 2000],
				infinite: true,
				duration: 5000,
				amount: 200,
				fallDistance: '100vh'
			});

			$$renderer.push(`<!----></div>`);
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Fullscreen</button>`);
			}
		}
	});

	$$renderer.push(`<!----></div> <br/> `);
	ConfettiOnClick($$renderer, {});
	$$renderer.push(`<!----> <h2 class="svelte-1uha8ag">Installation</h2> <p class="svelte-1uha8ag">Install using Yarn or NPM.</p> `);

	{
		function svelte4($$renderer) {
			$$renderer.push(`<!---->yarn add <mark class="svelte-1uha8ag">svelte-confetti@^1.0.0</mark> --dev`);
		}

		function svelte5($$renderer) {
			$$renderer.push(`<!---->yarn add <mark class="svelte-1uha8ag">svelte-confetti@^2.0.0</mark> --dev`);
		}

		CodeBlock($$renderer, { svelte4, svelte5, $$slots: { svelte4: true, svelte5: true } });
	}

	$$renderer.push(`<!----> `);

	{
		function svelte4($$renderer) {
			$$renderer.push(`<!---->npm install <mark class="svelte-1uha8ag">svelte-confetti@^1.0.0</mark> --save-dev`);
		}

		function svelte5($$renderer) {
			$$renderer.push(`<!---->npm install <mark class="svelte-1uha8ag">svelte-confetti@^2.0.0</mark> --save-dev`);
		}

		CodeBlock($$renderer, { svelte4, svelte5, $$slots: { svelte4: true, svelte5: true } });
	}

	$$renderer.push(`<!----> <p class="svelte-1uha8ag">Include the component in your app.</p> <code class="well svelte-1uha8ag">import { <mark class="svelte-1uha8ag">Confetti</mark> } from "<mark class="svelte-1uha8ag">svelte-confetti</mark>"</code> <code class="well svelte-1uha8ag">&lt;<mark class="svelte-1uha8ag">Confetti</mark> /></code></div> <h2 class="svelte-1uha8ag">Usage</h2> <mark class="svelte-1uha8ag">The Confetti comes without the buttons you will see in these examples. The buttons are simply used to demonstrate the effect in these docs.</mark> <div class="block svelte-1uha8ag"><div class="description svelte-1uha8ag">The component in it's most basic form. <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, {});
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Default</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti /></code></div></div></div> <div class="block svelte-1uha8ag"><h3 class="svelte-1uha8ag">Spread</h3> <div class="description svelte-1uha8ag">The spread of confetti can be adjusted. The props <mark class="svelte-1uha8ag">x</mark> and <mark class="svelte-1uha8ag">y</mark> are used to determine how far the confetti spreads. For both values multipliers are used and these are to be supplied in an array of two with the lowest number first. For each confetti piece a random number between these two is picked. The higher the number the futher the spread. Negative numbers affect the direction. <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { x: [-0.5, 0.5], y: [0.25, 1] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Default</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">x</mark>={[-0.5, 0.5]} <mark class="svelte-1uha8ag">y</mark>={[0.25, 1]} /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { x: [-1, -0.25], y: [0, 0.5] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Left</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">x</mark>={[-1, -0.25]} <mark class="svelte-1uha8ag">y</mark>={[0, 0.5]} /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { x: [0.25, 1], y: [0, 0.5] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Right</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">x</mark>={[0.25, 1]} <mark class="svelte-1uha8ag">y</mark>={[0, 0.5]} /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { x: [-0.25, 0.25], y: [0.75, 1.5] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Up</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">x</mark>={[-0.25, 0.25]} <mark class="svelte-1uha8ag">y</mark>={[0.75, 1.5]} /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { x: [-0.25, 0.25], y: [-0.75, -0.25] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Down</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">x</mark>={[-0.25, 0.25]} <mark class="svelte-1uha8ag">y</mark>={[-0.75, -0.25]} /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { x: [-0.5, 0.5], y: [-0.5, 0.5] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Everywhere</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">x</mark>={[-0.5, 0.5]} <mark class="svelte-1uha8ag">y</mark>={[-0.5, 0.5]} /></code></div></div></div> <div class="block svelte-1uha8ag"><h3 class="svelte-1uha8ag">Amount</h3> <div class="description svelte-1uha8ag">The amount of particles that are launched can be adjusted with the <mark class="svelte-1uha8ag">amount</mark> property. This should always be a whole number. Be careful with going too high as it may impact performance. It will depends on the device and other performance heavy elements on the page, but try and keep it below 500. <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { amount: 10 });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Few</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">amount</mark>=10 /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { amount: 50 });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Default</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">amount</mark>=50 /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { amount: 200 });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Lots</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">amount</mark>=200 /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { amount: 500 });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Too many</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">amount</mark>=500 /></code></div></div></div> <div class="block svelte-1uha8ag"><h3 class="svelte-1uha8ag">Shape</h3> <div class="description svelte-1uha8ag">As you may have noticed from the previous buttons, the confetti tends to take on a fairly square shape. This can be mitigated a little bit by using the propery <mark class="svelte-1uha8ag">cone</mark>. This will cause the confetti to launch in a more cone like shape which is especially nice when using lots of particles. <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { amount: 200 });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Default</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti amount=200 /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { cone: true, amount: 200 });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Cone</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">cone</mark> amount=200 /></code></div> This is especially effective when firing to the side, but we need to compensate with a larger x multiplier. <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { x: [0.25, 1], y: [0, 0.5] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Right</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti x={[0.25, 1]} y={[0, 0.5]} /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { cone: true, x: [1, 2.5], y: [0.25, 0.75] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Right Cone</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">cone</mark> x={[1, 2.5]} y={[0.25, 0.75]} /></code></div> The cones still have a fairly distinct cone shape to them, later on in these docs we will go over how to mitigate this.</div></div> <div class="block svelte-1uha8ag"><h3 class="svelte-1uha8ag">Size</h3> <div class="description svelte-1uha8ag">The size of the confetti pieces can be adjusted using the <mark class="svelte-1uha8ag">size</mark> property. <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { size: 2 });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Tiny</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">size</mark>=2 /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { size: 30 });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Huge</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">size</mark>=30 /></code></div> We can also adjust the shape of the confetti pieces using the <mark class="svelte-1uha8ag">rounded</mark> property <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { rounded: true, size: 30 });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Round</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">rounded</mark> size=30 /></code></div></div></div> <div class="block svelte-1uha8ag"><h3 class="svelte-1uha8ag">Timing</h3> <div class="description svelte-1uha8ag">By default all confetti comes out at just about the same time. There is a little bit of variance but it appears instant. That's what a confetti cannon does. We can change when each piece is fired by adjusted the range of the <mark class="svelte-1uha8ag">delay</mark> property. The delay is given in milliseconds. <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { delay: [0, 250] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Short delay</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">delay</mark>={[0, 250]} /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { delay: [0, 1500] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Long delay</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">delay</mark>={[0, 1500]} /></code></div> We can also opt to have the animation play infinitely by setting the <mark class="svelte-1uha8ag">infinite</mark> property, at this point the delay mostly has a effect only when spawning in for the first time. (Click the button again to toggle it off) <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		toggleOnce: true,
		children: ($$renderer) => {
			Confetti($$renderer, { infinite: true });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Default</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">infinite</mark> /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		toggleOnce: true,
		children: ($$renderer) => {
			Confetti($$renderer, { infinite: true, delay: [0, 1500] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Long delay</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">infinite</mark> <mark class="svelte-1uha8ag">delay</mark>={[0, 1500]} /></code></div> Alternatively we can let the animation play out fully before repeating. For this we can use the <mark class="svelte-1uha8ag">iterationCount</mark> property. This is especially useful during development to tweak the confetti without having to reload the page or set up a button. This can be set to a number or to "infinite", basically anything that would be accepted by the animation-iteration-count property in CSS. <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		toggleOnce: true,
		children: ($$renderer) => {
			Confetti($$renderer, { iterationCount: 'infinite' });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Infinite</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">iterationCount</mark>=infinite /></code></div></div></div> <div class="block svelte-1uha8ag"><h3 class="svelte-1uha8ag">Color</h3> <div class="description svelte-1uha8ag">You can adjust the colors of the confetti pieces in different ways. You can specify a hue using the <mark class="svelte-1uha8ag">colorRange</mark> property, which will use HSL colors with 75% saturation and 50% lightness. 0-360 is all colors, 75-175 would be only greens. Alternatively you can specifiy colors in an array using <mark class="svelte-1uha8ag">colorArray</mark>. This can take any CSS value that would be accepted as the background property. RGB, HEX, HSL, but even gradients and images. <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { colorRange: [75, 175] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Green range</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">colorRange</mark>={[75, 175]} /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, {
				colorArray: ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"]
			});
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Array</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">colorArray</mark>={["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"]} /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, {
				colorArray: ["var(--primary)", "rgba(0, 255, 0, 0.5)", "white"]
			});
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Different values</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">colorArray</mark>={["var(--primary)", "rgba(0, 255, 0, 0.5)", "white"]} /></code></div> It's not just colors though, we can input any value valid to the background css property. This includes gradients and images. <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, {
				size: 20,
				colorArray: ["linear-gradient(var(--primary), blue)"]
			});
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Gradient</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">colorArray</mark>={["linear-gradient(var(--primary), blue)"]} /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, {
				size: 20,
				colorArray: [
					"url(https://svelte.dev/favicon.png)",
					"url(https://github.githubassets.com/favicons/favicon-dark.png)"
				]
			});
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Images</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">colorArray</mark>={["url(https://svelte.dev/favicon.png)", "url(https://github.githubassets.com/favicons/favicon-dark.png)"]} /></code></div> Or we could set up a random color each time the component is mounted. <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, {
				colorArray: [`hsl(${Math.floor(Math.random() * 360)}, 75%, 50%)`]
			});
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Random</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">colorArray</mark>={[\`hsl(\${Math.floor(Math.random() * 360)}, 75%, 50%)\`]} /></code></div></div></div> <div class="block svelte-1uha8ag"><h3 class="svelte-1uha8ag">Gravity</h3> <div class="description svelte-1uha8ag">We can change how the confetti falls using the <mark class="svelte-1uha8ag">fallDistance</mark> property. We can make it fall faster, slow, or stop it from falling altogether. This property will accept any valid css property, except for 0. <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { fallDistance: '50px' });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Slow fall</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">fallDistance</mark>=50px /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { fallDistance: '200px' });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Fast fall</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">fallDistance</mark>=200px /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { fallDistance: '0px' });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<div slot="label"><button class="svelte-1uha8ag">No fall</button> <small>Notice how it's set to <code class="inline svelte-1uha8ag">0px</code> and not just <code class="inline svelte-1uha8ag">0</code></small></div>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">fallDistance</mark>=0px /></code></div> We can also disable gravity and air resistance altogether and make it travel at a constant speed by setting the <mark class="svelte-1uha8ag">noGravity</mark> property. <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { noGravity: true, duration: 500 });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">No gravity</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">noGravity</mark> duration=500 /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, {
				noGravity: true,
				duration: 500,
				x: [-0.5, 0.5],
				y: [-0.5, 0.5]
			});
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">No gravity explosion</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">noGravity</mark> duration=500 x={[-0.5, 0.5]} y={[-0.5, 0.5]} /></code></div> We can set how far the particles spread horizontally before and after the peak using the <mark class="svelte-1uha8ag">xSpread</mark> property. This expects a number between 0 and 1 but you can set it higher or lower for some odd results. <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { xSpread: 0.1 });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Small spread</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">xSpread</mark>=0.1 /></code></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { xSpread: 0.4 });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Large spread</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">xSpread</mark>=0.4 /></code></div></div></div> <div class="block svelte-1uha8ag"><h3 class="svelte-1uha8ag">Multiple components</h3> <div class="description svelte-1uha8ag">We can combine multiple Confetti components to create neat effects.<br/> For example we could combine multiple components each with different colors and different areas to create flags! <small>(Blues aren't the actual flag colors to make it a little easier to see on dark backgrounds)</small> <br/><br/> <div>`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { y: [1.25, 1.5], x: [-1, 1], colorArray: ["#c8102e"] });
			$$renderer.push(`<!----> `);
			Confetti($$renderer, { y: [1, 1.25], x: [-1, 1], colorArray: ["white"] });
			$$renderer.push(`<!----> `);
			Confetti($$renderer, { y: [0.75, 1], x: [-1, 1], colorArray: ["#3350ec"] });
			$$renderer.push(`<!---->`);
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Dutch</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="well svelte-1uha8ag">&lt;Confetti y={[1.25, 1.5]} x={[-1, 1]} colorArray={["#c8102e"]} /> <br/> &lt;Confetti  y={[1, 1.25]} x={[-1, 1]} colorArray={["white"]} /> <br/> &lt;Confetti  y={[0.75, 1]} x={[-1, 1]} colorArray={["#3350ec"]} /> <br/></code></div> <br/> <div>`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, {
				y: [0.75, 1.5],
				x: [-1, 1],
				colorArray: ["#3350ec"],
				amount: 100
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				y: [1.05, 1.20],
				x: [-1, 1],
				colorArray: ["#ffcd00"],
				amount: 50
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				y: [0.75, 1.5],
				x: [-0.5, -0.25],
				colorArray: ["#ffcd00"],
				amount: 20
			});

			$$renderer.push(`<!---->`);
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Swedish</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="well svelte-1uha8ag">&lt;Confetti y={[0.75, 1.5]} x={[-1, 1]} colorArray={["#004b87"]} amount=100 /> <br/> &lt;Confetti y={[1.05, 1.20]} x={[-1, 1]} colorArray={["#ffcd00"]} amount=50 /> <br/> &lt;Confetti y={[0.75, 1.5]} x={[-0.5, -0.25]} colorArray={["#ffcd00"]} amount=20 /> <br/></code></div> <br/> <div>`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, {
				y: [1.15, 1.5],
				x: [-1, -0.25],
				colorArray: ["#3350ec"],
				amount: 100
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				y: [1.20, 1.45],
				x: [-0.95, -0.3],
				colorArray: ["white"],
				size: 5
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				y: [1.45, 1.5],
				x: [-0.25, 1],
				colorArray: ["#bf0d3e"],
				amount: 70
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				y: [1.4, 1.45],
				x: [-0.25, 1],
				colorArray: ["white"],
				amount: 70
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				y: [1.35, 1.4],
				x: [-0.25, 1],
				colorArray: ["#bf0d3e"],
				amount: 70
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				y: [1.3, 1.35],
				x: [-0.25, 1],
				colorArray: ["white"],
				amount: 70
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				y: [1.25, 1.3],
				x: [-0.25, 1],
				colorArray: ["#bf0d3e"],
				amount: 70
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				y: [1.2, 1.25],
				x: [-0.25, 1],
				colorArray: ["white"],
				amount: 70
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				y: [1.15, 1.2],
				x: [-0.25, 1],
				colorArray: ["#bf0d3e"],
				amount: 70
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				y: [1.1, 1.15],
				x: [-1, 1],
				colorArray: ["white"],
				amount: 70
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				y: [1.05, 1.1],
				x: [-1, 1],
				colorArray: ["#bf0d3e"],
				amount: 70
			});

			$$renderer.push(`<!----> `);
			Confetti($$renderer, { y: [1, 1.05], x: [-1, 1], colorArray: ["white"], amount: 70 });
			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				y: [0.95, 1],
				x: [-1, 1],
				colorArray: ["#bf0d3e"],
				amount: 70
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				y: [0.9, 0.95],
				x: [-1, 1],
				colorArray: ["white"],
				amount: 70
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				y: [0.85, 0.9],
				x: [-1, 1],
				colorArray: ["#bf0d3e"],
				amount: 70
			});

			$$renderer.push(`<!---->`);
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<div slot="label"><button class="svelte-1uha8ag">USA</button></div>`);
			}
		}
	});

	$$renderer.push(`<!----> <small>This one is heavy! This uses 1015 effects, more than recommended, but it looks neat!</small> <code class="well svelte-1uha8ag">&lt;Confetti y={[1.20, 1.45]} x={[-0.95, -0.3]} colorArray={["white"]} size=5 /> <br/> &lt;Confetti y={[1.45, 1.5]} x={[-0.25, 1]} colorArray={["#bf0d3e"]} amount=70 /> <br/> &lt;Confetti y={[1.4, 1.45]} x={[-0.25, 1]} colorArray={["white"]} amount=70 /> <br/> &lt;Confetti y={[1.35, 1.4]} x={[-0.25, 1]} colorArray={["#bf0d3e"]} amount=70 /> <br/> &lt;Confetti y={[1.3, 1.35]} x={[-0.25, 1]} colorArray={["white"]} amount=70 /> <br/> &lt;Confetti y={[1.25, 1.3]} x={[-0.25, 1]} colorArray={["#bf0d3e"]} amount=70 /> <br/> &lt;Confetti y={[1.2, 1.25]} x={[-0.25, 1]} colorArray={["white"]} amount=70 /> <br/> &lt;Confetti y={[1.15, 1.2]} x={[-0.25, 1]} colorArray={["#bf0d3e"]} amount=70 /> <br/> &lt;Confetti y={[1.1, 1.15]} x={[-1, 1]} colorArray={["white"]} amount=70 /> <br/> &lt;Confetti y={[1.05, 1.1]} x={[-1, 1]} colorArray={["#bf0d3e"]} amount=70 /> <br/> &lt;Confetti y={[1, 1.05]} x={[-1, 1]} colorArray={["white"]} amount=70 /> <br/> &lt;Confetti y={[0.95, 1]} x={[-1, 1]} colorArray={["#bf0d3e"]} amount=70 /> <br/> &lt;Confetti y={[0.9, 0.95]} x={[-1, 1]} colorArray={["white"]} amount=70 /> <br/> &lt;Confetti y={[0.85, 0.9]} x={[-1, 1]} colorArray={["#bf0d3e"]} amount=70 /> <br/></code></div> <br/> Flags are cool, but we can do plenty of other things. In this example we will "feather" the initial effect to give it a less defined shape. By default the effects have a fairly distinct shape to them which ruins the effect a little bit, especially when using lots of particles. <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { amount: 70, x: [-0.5, 0.5] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Not feathered</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <div><code class="svelte-1uha8ag">&lt;Confetti y={[1.25, 1.5]} x={[-1, 1]} colorArray={["#c8102e"]} /></code></div></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { x: [-0.5, 0.5] });
			$$renderer.push(`<!----> `);
			Confetti($$renderer, { amount: 10, x: [-0.75, -0.3], y: [0.15, 0.75] });
			$$renderer.push(`<!----> `);
			Confetti($$renderer, { amount: 10, x: [0.3, 0.75], y: [0.15, 0.75] });
			$$renderer.push(`<!---->`);
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Feathered</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <div><code class="svelte-1uha8ag">&lt;Confetti x={[-0.5, 0.5]} /></code> <code class="svelte-1uha8ag">&lt;Confetti amount=10 x={[-0.75, -0.3]} y={[0.15, 0.75]} /></code> <code class="svelte-1uha8ag">&lt;Confetti amount=10 x={[0.3, 0.75]} y={[0.15, 0.75]} /></code></div></div> And with the cone property <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { cone: true, amount: 70, x: [-0.5, 0.5] });
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Cone</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <div><code class="svelte-1uha8ag">&lt;Confetti cone amount=70 x={[-0.5, 0.5]} /></code></div></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { cone: true, x: [-0.5, 0.5] });
			$$renderer.push(`<!----> `);
			Confetti($$renderer, { cone: true, amount: 10, x: [-0.75, -0.4], y: [0.15, 0.75] });
			$$renderer.push(`<!----> `);
			Confetti($$renderer, { cone: true, amount: 10, x: [0.4, 0.75], y: [0.15, 0.75] });
			$$renderer.push(`<!---->`);
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Feathered cone</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <div><code class="svelte-1uha8ag">&lt;Confetti cone x={[-0.5, 0.5]} /></code> <code class="svelte-1uha8ag">&lt;Confetti cone amount=10 x={[-0.75, -0.4]} y={[0.15, 0.75]} /></code> <code class="svelte-1uha8ag">&lt;Confetti cone amount=10 x={[0.4, 0.75]} y={[0.15, 0.75]} /></code></div></div> We can also combine this with a large delay to mitigate the effect further, but it makes it less cannon-y. <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { x: [-0.5, 0.5], delay: [0, 250] });
			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				amount: 10,
				x: [-0.75, -0.3],
				y: [0.15, 0.75],
				delay: [0, 1000]
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				amount: 10,
				x: [0.3, 0.75],
				y: [0.15, 0.75],
				delay: [0, 1000]
			});

			$$renderer.push(`<!---->`);
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Feathered and delayed</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <div><code class="svelte-1uha8ag">&lt;Confetti x={[-0.5, 0.5]} delay={[0, 250]} /></code> <code class="svelte-1uha8ag">&lt;Confetti amount=10 x={[-0.75, -0.3]} y={[0.15, 0.75]} delay={[0, 1000]} /></code> <code class="svelte-1uha8ag">&lt;Confetti amount=10 x={[0.3, 0.75]} y={[0.15, 0.75]} delay={[0, 1000]} /></code></div></div> We could also combine multiple components to create animations. <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, { cone: true, x: [-1, -0.25], colorRange: [100, 200] });
			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				cone: true,
				x: [-0.35, 0.35],
				delay: [500, 550],
				colorRange: [200, 300]
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				cone: true,
				x: [0.25, 1],
				delay: [250, 300],
				colorRange: [100, 200]
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				cone: true,
				amount: 20,
				x: [-1, 1],
				y: [0, 1],
				delay: [0, 550],
				colorRange: [200, 300]
			});

			$$renderer.push(`<!---->`);
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Animate</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <div><code class="svelte-1uha8ag">&lt;Confetti cone x={[-1, -0.25]} colorRange={[100, 200]} /></code> <code class="svelte-1uha8ag">&lt;Confetti cone x={[-0.35, 0.35]} delay={[500, 550]} colorRange={[200, 300]} /></code> <code class="svelte-1uha8ag">&lt;Confetti cone x={[0.25, 1]} delay={[250, 300]} colorRange={[100, 200]} /></code> <code class="svelte-1uha8ag">&lt;Confetti cone amount=20 x={[-1, 1]} y={[0, 1]} delay={[0, 550]} colorRange={[200, 300]} /></code></div></div> <div class="button-code-group svelte-1uha8ag">`);

	ToggleConfetti($$renderer, {
		children: ($$renderer) => {
			Confetti($$renderer, {
				noGravity: true,
				x: [-1, 1],
				y: [-1, 1],
				delay: [0, 50],
				duration: 1000,
				colorRange: [0, 120]
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				noGravity: true,
				x: [-1, 1],
				y: [-1, 1],
				delay: [550, 550],
				duration: 1000,
				colorRange: [120, 240]
			});

			$$renderer.push(`<!----> `);

			Confetti($$renderer, {
				noGravity: true,
				x: [-1, 1],
				y: [-1, 1],
				delay: [1000, 1050],
				duration: 1000,
				colorRange: [240, 360]
			});

			$$renderer.push(`<!---->`);
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Animate explosion</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <div><code class="svelte-1uha8ag">&lt;Confetti noGravity x={[-1, 1]} y={[-1, 1]} delay={[0, 50]} duration=1000 colorRange={[0, 120]} /></code> <code class="svelte-1uha8ag">&lt;Confetti noGravity x={[-1, 1]} y={[-1, 1]} delay={[550, 550]} duration=1000 colorRange={[120, 240]} /></code> <code class="svelte-1uha8ag">&lt;Confetti noGravity x={[-1, 1]} y={[-1, 1]} delay={[1000, 1050]} duration=1000 colorRange={[240, 360]} /></code></div></div></div></div> <div class="block svelte-1uha8ag"><h3 class="svelte-1uha8ag">Styling it further</h3> <div class="description svelte-1uha8ag">We've now looked at all the different properties, but since this is just HTML and CSS you can style it further however you like. Let's look at some fullscreen examples. Having the effect fullscreen is not a simple toggle, but it is a simple bit of CSS. <br/><br/> <div>`);

	ToggleConfetti($$renderer, {
		toggleOnce: true,
		relative: false,
		children: ($$renderer) => {
			$$renderer.push(`<div style="position: fixed; top: -50px; left: 0; height: 100vh; width: 100vw; display: flex; justify-content: center; overflow: hidden; pointer-events: none;">`);

			Confetti($$renderer, {
				x: [-5, 5],
				y: [0, 0.1],
				delay: [500, 2000],
				infinite: true,
				duration: 5000,
				amount: 200,
				fallDistance: '100vh'
			});

			$$renderer.push(`<!----></div>`);
		},

		$$slots: {
			default: true,
			label: ($$renderer) => {
				$$renderer.push(`<button slot="label" class="svelte-1uha8ag">Fullscreen</button>`);
			}
		}
	});

	$$renderer.push(`<!----> <code class="well svelte-1uha8ag">&lt;div style="<br/>  position: fixed;<br/>  top: -50px;<br/>  left: 0;<br/>  height: 100vh;<br/>  width: 100vw;<br/>  display: flex;<br/>  justify-content: center;<br/>  overflow: hidden;<br/>  pointer-events: none;"><br/>  &lt;Confetti x={[-5, 5]} y={[0, 0.1]} delay={[500, 2000]} infinite duration=5000 amount=200 fallDistance="100vh" /> <br/> &lt;/div></code></div> <br/> The element is fixed and placed just off screen so we can't see the confetti spawn in. The <mark class="svelte-1uha8ag">fallDistance</mark> property is set to <code class="inline svelte-1uha8ag">100vh</code> so they cover the entire screen. <br/> <br/> One thing you may have noticed is that if you click a button the previous confetti disappears immediately and new ones spawn in. We could change this by creating a new component for each click. Check out the code for this example in the <a target="_blank" href="https://svelte.dev/repl/21a63990161c481d97483c1f1d4de597" class="svelte-1uha8ag">REPL</a>. <br/> <br/> `);
	ConfettiOnClick($$renderer, {});
	$$renderer.push(`<!----> <br/> <br/> <br/> <br/> You could also further style the confetti itself. Don't like the animation? Do it yourself! Target the confetti with <code class="inline svelte-1uha8ag">:global(.confetti)</code> and change the animation using <code class="inline svelte-1uha8ag">animation-name</code>, all values are set as css variables so you can easily use them yourself.</div></div> <h2 class="svelte-1uha8ag">Properties</h2> <div class="block svelte-1uha8ag"><p class="svelte-1uha8ag">This is a list of all configurable properties.</p> <div class="table svelte-1uha8ag"><strong class="svelte-1uha8ag">Property</strong> <strong class="svelte-1uha8ag">Default</strong> <strong class="svelte-1uha8ag">Description</strong> <code class="svelte-1uha8ag">size</code> <code class="svelte-1uha8ag">10</code> <div>The max size in pixels of the individual confetti pieces.</div> <code class="svelte-1uha8ag">x</code> <code class="svelte-1uha8ag">[-0.5, 0.5]</code> <div>The max horizontal range of the confetti pieces. Negative is left, positive is right. [-1, 1] would mean maximum of 200px left and 200px right.</div> <code class="svelte-1uha8ag">y</code> <code class="svelte-1uha8ag">[0.25, 1]</code> <div>The max vertical range of the confetti pieces. Negative is down, positive is up. [-1, 1] would mean maximum of 200px down and 200px up.</div> <code class="svelte-1uha8ag">duration</code> <code class="svelte-1uha8ag">2000</code> <div>Duration of the animation for each individual piece.</div> <code class="svelte-1uha8ag">infinite</code> <code class="svelte-1uha8ag">false</code> <div>If set to true the animation will play indefinitely.</div> <code class="svelte-1uha8ag">delay</code> <code class="svelte-1uha8ag">[0, 50]</code> <div>Used to set a random delay for each piece. A large difference between each number will mean a longer spray time.</div> <code class="svelte-1uha8ag">colorRange</code> <code class="svelte-1uha8ag">[0, 360]</code> <div>Color range on the HSL color wheel. 0 to 360 is full RGB. 75 To 150 would be only green colors.</div> <code class="svelte-1uha8ag">colorArray</code> <code class="svelte-1uha8ag">[]</code> <div>Can be used to pick a random color from this array. Set just one array elements to have a single color. Accepts any viable css background property, including gradients and images.</div> <code class="svelte-1uha8ag">amount</code> <code class="svelte-1uha8ag">50</code> <div>Amount of particles spawned. The larger your spray the more pieces you might want. Be careful with too many as it might impact performance.</div> <code class="svelte-1uha8ag">iterationCount</code> <code class="svelte-1uha8ag">1</code> <div>How many times the animation will play before stopping. Is overwritten by the "infinite" property.</div> <code class="svelte-1uha8ag">fallDistance</code> <code class="svelte-1uha8ag">"100px"</code> <div>How far each piece falls. Accepts any css property, px, rem, vh, etc, but not 0.</div> <code class="svelte-1uha8ag">rounded</code> <code class="svelte-1uha8ag">false</code> <div>Set to true to make each confetti piece rounded.</div> <code class="svelte-1uha8ag">cone</code> <code class="svelte-1uha8ag">false</code> <div>Set to true to make the explosion appear in a cone like shape which might feel more realistic when dealing with a larger amount.</div> <code class="svelte-1uha8ag">noGravity</code> <code class="svelte-1uha8ag">false</code> <div>Set to true to make the particles accelerate at a constant speed without "falling" down. Give it a more explosion like effect.</div> <code class="svelte-1uha8ag">xSpread</code> <code class="svelte-1uha8ag">0.15</code> <div>A number from 0 to 1 that determines how far the particles spread horizontally. A low number will mean the x near the peak and the x near the end are similar.</div> <code class="svelte-1uha8ag">destroyOnComplete</code> <code class="svelte-1uha8ag">true</code> <div>By default the elements are removed when the animation is complete. Set to false to prevent this behaviour.</div> <code class="svelte-1uha8ag">disableForReducedMotion</code> <code class="svelte-1uha8ag">false</code> <div>Disable animations for those with reduced motion preferences.</div></div></div> <div class="block svelte-1uha8ag">Made by <a href="https://github.com/Mitcheljager" class="svelte-1uha8ag">Mitchel Jager</a></div></div>`);
}