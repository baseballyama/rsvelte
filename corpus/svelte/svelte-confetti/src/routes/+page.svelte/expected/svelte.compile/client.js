import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Confetti from "$lib/Confetti.svelte";
import ToggleConfetti from "./ToggleConfetti.svelte";
import ConfettiOnClick from "./ConfettiOnClick.svelte";
import CodeBlock from "./CodeBlock.svelte";

var root = $.from_html(`<button slot="label" class="svelte-1uha8ag">Default</button>`);
var root_1 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Lots</button>`);
var root_2 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Few</button>`);
var root_3 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Large</button>`);
var root_4 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Rounded</button>`);
var root_5 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Colored</button>`);
var root_6 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Multi Colored</button>`);
var root_7 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Images</button>`);
var root_8 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Gradient</button>`);
var root_9 = $.from_html(`<!> <!> <!>`, 1);
var root_10 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Flag</button>`);
var root_11 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Vertical</button>`);
var root_12 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Horizontal</button>`);
var root_13 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Cone</button>`);
var root_14 = $.from_html(`<button slot="label" class="svelte-1uha8ag">All around</button>`);
var root_15 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Explosion</button>`);
var root_16 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Sparkles</button>`);
var root_17 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Spray</button>`);
var root_18 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Feathered</button>`);
var root_19 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Constant</button>`);
var root_20 = $.from_html(`<div style="position: fixed; top: -50px; left: 0; height: 100vh; width: 100vw; display: flex; justify-content: center; overflow: hidden; pointer-events: none;"><!></div>`);
var root_21 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Fullscreen</button>`);
var root_22 = $.from_html(`yarn add <mark class="svelte-1uha8ag">svelte-confetti@^1.0.0</mark> --dev`, 1);
var root_23 = $.from_html(`yarn add <mark class="svelte-1uha8ag">svelte-confetti@^2.0.0</mark> --dev`, 1);
var root_24 = $.from_html(`npm install <mark class="svelte-1uha8ag">svelte-confetti@^1.0.0</mark> --save-dev`, 1);
var root_25 = $.from_html(`npm install <mark class="svelte-1uha8ag">svelte-confetti@^2.0.0</mark> --save-dev`, 1);
var root_26 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Left</button>`);
var root_27 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Right</button>`);
var root_28 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Up</button>`);
var root_29 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Down</button>`);
var root_30 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Everywhere</button>`);
var root_31 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Too many</button>`);
var root_32 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Right Cone</button>`);
var root_33 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Tiny</button>`);
var root_34 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Huge</button>`);
var root_35 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Round</button>`);
var root_36 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Short delay</button>`);
var root_37 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Long delay</button>`);
var root_38 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Infinite</button>`);
var root_39 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Green range</button>`);
var root_40 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Array</button>`);
var root_41 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Different values</button>`);
var root_42 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Random</button>`);
var root_43 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Slow fall</button>`);
var root_44 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Fast fall</button>`);
var root_45 = $.from_html(`<div slot="label"><button class="svelte-1uha8ag">No fall</button> <small>Notice how it's set to <code class="inline svelte-1uha8ag">0px</code> and not just <code class="inline svelte-1uha8ag">0</code></small></div>`);
var root_46 = $.from_html(`<button slot="label" class="svelte-1uha8ag">No gravity</button>`);
var root_47 = $.from_html(`<button slot="label" class="svelte-1uha8ag">No gravity explosion</button>`);
var root_48 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Small spread</button>`);
var root_49 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Large spread</button>`);
var root_50 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Dutch</button>`);
var root_51 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Swedish</button>`);
var root_52 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_53 = $.from_html(`<div slot="label"><button class="svelte-1uha8ag">USA</button></div>`);
var root_54 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Not feathered</button>`);
var root_55 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Feathered cone</button>`);
var root_56 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Feathered and delayed</button>`);
var root_57 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_58 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Animate</button>`);
var root_59 = $.from_html(`<button slot="label" class="svelte-1uha8ag">Animate explosion</button>`);
var root_60 = $.from_html(`<div class="wrapper svelte-1uha8ag"><div class="header svelte-1uha8ag"><h1 class="svelte-1uha8ag"><!> <mark class="svelte-1uha8ag">Svelte</mark>&nbsp;Confetti <!></h1></div> <div class="block svelte-1uha8ag"><p class="svelte-1uha8ag">Add a little bit of flair to your app with some confetti 🎊! There are no dependencies and it's tiny in size. Even better; it works without JavaScript with the help of SSR in SvelteKit <em>(this page doesn't use SSR though)</em>!</p> <p class="svelte-1uha8ag"><a target="_blank" href="https://github.com/Mitcheljager/svelte-confetti" class="svelte-1uha8ag">GitHub</a> | <a target="_blank" href="https://svelte.dev/repl/21a63990161c481d97483c1f1d4de597" class="svelte-1uha8ag">REPL</a></p> <h2 class="svelte-1uha8ag">Demo</h2> <p class="svelte-1uha8ag">Click these buttons to see their effect. Most of these are not just a single toggle, they are a combination of multiple props. Don't worry we'll go over each one in the documentation further down the page!</p> <div class="buttons svelte-1uha8ag"><!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div> <br/> <!> <h2 class="svelte-1uha8ag">Installation</h2> <p class="svelte-1uha8ag">Install using Yarn or NPM.</p> <!> <!> <p class="svelte-1uha8ag">Include the component in your app.</p> <code class="well svelte-1uha8ag">import &#123; <mark class="svelte-1uha8ag">Confetti</mark> &#125; from "<mark class="svelte-1uha8ag">svelte-confetti</mark>"</code> <code class="well svelte-1uha8ag">&lt;<mark class="svelte-1uha8ag">Confetti</mark> /&gt;</code></div> <h2 class="svelte-1uha8ag">Usage</h2> <mark class="svelte-1uha8ag">The Confetti comes without the buttons you will see in these examples. The buttons are simply used to demonstrate the effect in these docs.</mark> <div class="block svelte-1uha8ag"><div class="description svelte-1uha8ag">The component in it's most basic form. <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti /&gt;</code></div></div></div> <div class="block svelte-1uha8ag"><h3 class="svelte-1uha8ag">Spread</h3> <div class="description svelte-1uha8ag">The spread of confetti can be adjusted. The props <mark class="svelte-1uha8ag">x</mark> and <mark class="svelte-1uha8ag">y</mark> are used to determine how far the confetti spreads. For both values multipliers are used and these are to be supplied in an array of two with the lowest number first. For each confetti piece a random number between these two is picked. The higher the number the futher the spread. Negative numbers affect the direction. <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">x</mark>=&#123;[-0.5, 0.5]&#125; <mark class="svelte-1uha8ag">y</mark>=&#123;[0.25, 1]&#125; /&gt;</code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">x</mark>=&#123;[-1, -0.25]&#125; <mark class="svelte-1uha8ag">y</mark>=&#123;[0, 0.5]&#125; /&gt;</code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">x</mark>=&#123;[0.25, 1]&#125; <mark class="svelte-1uha8ag">y</mark>=&#123;[0, 0.5]&#125; /&gt;</code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">x</mark>=&#123;[-0.25, 0.25]&#125; <mark class="svelte-1uha8ag">y</mark>=&#123;[0.75, 1.5]&#125; /&gt;</code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">x</mark>=&#123;[-0.25, 0.25]&#125; <mark class="svelte-1uha8ag">y</mark>=&#123;[-0.75, -0.25]&#125; /&gt;</code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">x</mark>=&#123;[-0.5, 0.5]&#125; <mark class="svelte-1uha8ag">y</mark>=&#123;[-0.5, 0.5]&#125; /&gt;</code></div></div></div> <div class="block svelte-1uha8ag"><h3 class="svelte-1uha8ag">Amount</h3> <div class="description svelte-1uha8ag">The amount of particles that are launched can be adjusted with the <mark class="svelte-1uha8ag">amount</mark> property. This should always be a whole number. Be careful with going too high as it may impact performance. It will depends on the device and other performance heavy elements on the page, but try and keep it below 500. <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">amount</mark>=10 /&gt;</code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">amount</mark>=50 /&gt;</code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">amount</mark>=200 /&gt;</code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">amount</mark>=500 /&gt;</code></div></div></div> <div class="block svelte-1uha8ag"><h3 class="svelte-1uha8ag">Shape</h3> <div class="description svelte-1uha8ag">As you may have noticed from the previous buttons, the confetti tends to take on a fairly square shape. This can be mitigated a little bit by using the propery <mark class="svelte-1uha8ag">cone</mark>. This will cause the confetti to launch in a more cone like shape which is especially nice when using lots of particles. <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag"></code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">cone</mark> </code></div> This is especially effective when firing to the side, but we need to compensate with a larger x multiplier. <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti x=&#123;[0.25, 1]&#125; y=&#123;[0, 0.5]&#125; /&gt;</code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">cone</mark> x=&#123;[1, 2.5]&#125; y=&#123;[0.25, 0.75]&#125; /&gt;</code></div> The cones still have a fairly distinct cone shape to them, later on in these docs we will go over how to mitigate this.</div></div> <div class="block svelte-1uha8ag"><h3 class="svelte-1uha8ag">Size</h3> <div class="description svelte-1uha8ag">The size of the confetti pieces can be adjusted using the <mark class="svelte-1uha8ag">size</mark> property. <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">size</mark>=2 /&gt;</code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">size</mark>=30 /&gt;</code></div> We can also adjust the shape of the confetti pieces using the <mark class="svelte-1uha8ag">rounded</mark> property <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">rounded</mark> </code></div></div></div> <div class="block svelte-1uha8ag"><h3 class="svelte-1uha8ag">Timing</h3> <div class="description svelte-1uha8ag">By default all confetti comes out at just about the same time. There is a little bit of variance but it appears instant. That's what a confetti cannon does. We can change when each piece is fired by adjusted the range of the <mark class="svelte-1uha8ag">delay</mark> property. The delay is given in milliseconds. <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">delay</mark>=&#123;[0, 250]&#125; /&gt;</code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">delay</mark>=&#123;[0, 1500]&#125; /&gt;</code></div> We can also opt to have the animation play infinitely by setting the <mark class="svelte-1uha8ag">infinite</mark> property, at this point the delay mostly has a effect only when spawning in for the first time. (Click the button again to toggle it off) <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">infinite</mark> /&gt;</code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">infinite</mark> <mark class="svelte-1uha8ag">delay</mark>=&#123;[0, 1500]&#125; /&gt;</code></div> Alternatively we can let the animation play out fully before repeating. For this we can use the <mark class="svelte-1uha8ag">iterationCount</mark> property. This is especially useful during development to tweak the confetti without having to reload the page or set up a button. This can be set to a number or to "infinite", basically anything that would be accepted by the animation-iteration-count property in CSS. <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">iterationCount</mark>=infinite /&gt;</code></div></div></div> <div class="block svelte-1uha8ag"><h3 class="svelte-1uha8ag">Color</h3> <div class="description svelte-1uha8ag">You can adjust the colors of the confetti pieces in different ways. You can specify a hue using the <mark class="svelte-1uha8ag">colorRange</mark> property, which will use HSL colors with 75% saturation and 50% lightness. 0-360 is all colors, 75-175 would be only greens. Alternatively you can specifiy colors in an array using <mark class="svelte-1uha8ag">colorArray</mark>. This can take any CSS value that would be accepted as the background property. RGB, HEX, HSL, but even gradients and images. <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">colorRange</mark>=&#123;[75, 175]&#125; /&gt;</code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">colorArray</mark>=&#123;["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"]&#125; /&gt;</code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">colorArray</mark>=&#123;["var(--primary)", "rgba(0, 255, 0, 0.5)", "white"]&#125; /&gt;</code></div> It's not just colors though, we can input any value valid to the background css property. This includes gradients and images. <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">colorArray</mark>=&#123;["linear-gradient(var(--primary), blue)"]&#125; /&gt;</code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">colorArray</mark>=&#123;["url(https://svelte.dev/favicon.png)", "url(https://github.githubassets.com/favicons/favicon-dark.png)"]&#125; /&gt;</code></div> Or we could set up a random color each time the component is mounted. <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">colorArray</mark>=&#123;[\`hsl($&#123;Math.floor(Math.random() * 360)&#125;, 75%, 50%)\`]&#125; /&gt;</code></div></div></div> <div class="block svelte-1uha8ag"><h3 class="svelte-1uha8ag">Gravity</h3> <div class="description svelte-1uha8ag">We can change how the confetti falls using the <mark class="svelte-1uha8ag">fallDistance</mark> property. We can make it fall faster, slow, or stop it from falling altogether. This property will accept any valid css property, except for 0. <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">fallDistance</mark>=50px /&gt;</code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">fallDistance</mark>=200px /&gt;</code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">fallDistance</mark>=0px /&gt;</code></div> We can also disable gravity and air resistance altogether and make it travel at a constant speed by setting the <mark class="svelte-1uha8ag">noGravity</mark> property. <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">noGravity</mark> </code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">noGravity</mark> </code></div> We can set how far the particles spread horizontally before and after the peak using the <mark class="svelte-1uha8ag">xSpread</mark> property. This expects a number between 0 and 1 but you can set it higher or lower for some odd results. <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">xSpread</mark>=0.1 /&gt;</code></div> <div class="button-code-group svelte-1uha8ag"><!> <code class="svelte-1uha8ag">&lt;Confetti <mark class="svelte-1uha8ag">xSpread</mark>=0.4 /&gt;</code></div></div></div> <div class="block svelte-1uha8ag"><h3 class="svelte-1uha8ag">Multiple components</h3> <div class="description svelte-1uha8ag">We can combine multiple Confetti components to create neat effects.<br/> For example we could combine multiple components each with different colors and different areas to create flags! <small>(Blues aren't the actual flag colors to make it a little easier to see on dark backgrounds)</small> <br/><br/> <div><!> <code class="well svelte-1uha8ag">&lt;Confetti y=&#123;[1.25, 1.5]&#125; x=&#123;[-1, 1]&#125; colorArray=&#123;["#c8102e"]&#125; /&gt; <br/> &lt;Confetti  y=&#123;[1, 1.25]&#125; x=&#123;[-1, 1]&#125; colorArray=&#123;["white"]&#125; /&gt; <br/> &lt;Confetti  y=&#123;[0.75, 1]&#125; x=&#123;[-1, 1]&#125; colorArray=&#123;["#3350ec"]&#125; /&gt; <br/></code></div> <br/> <div><!> <code class="well svelte-1uha8ag"> <br/> <br/> <br/></code></div> <br/> <div><!> <small>This one is heavy! This uses 1015 effects, more than recommended, but it looks neat!</small> <code class="well svelte-1uha8ag"> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/></code></div> <br/> Flags are cool, but we can do plenty of other things. In this example we will "feather" the initial effect to give it a less defined shape. By default the effects have a fairly distinct shape to them which ruins the effect a little bit, especially when using lots of particles. <div class="button-code-group svelte-1uha8ag"><!> <div><code class="svelte-1uha8ag">&lt;Confetti y=&#123;[1.25, 1.5]&#125; x=&#123;[-1, 1]&#125; colorArray=&#123;["#c8102e"]&#125; /&gt;</code></div></div> <div class="button-code-group svelte-1uha8ag"><!> <div><code class="svelte-1uha8ag">&lt;Confetti x=&#123;[-0.5, 0.5]&#125; /&gt;</code> <code class="svelte-1uha8ag"></code> <code class="svelte-1uha8ag"></code></div></div> And with the cone property <div class="button-code-group svelte-1uha8ag"><!> <div><code class="svelte-1uha8ag"></code></div></div> <div class="button-code-group svelte-1uha8ag"><!> <div><code class="svelte-1uha8ag">&lt;Confetti cone x=&#123;[-0.5, 0.5]&#125; /&gt;</code> <code class="svelte-1uha8ag"></code> <code class="svelte-1uha8ag"></code></div></div> We can also combine this with a large delay to mitigate the effect further, but it makes it less cannon-y. <div class="button-code-group svelte-1uha8ag"><!> <div><code class="svelte-1uha8ag">&lt;Confetti x=&#123;[-0.5, 0.5]&#125; delay=&#123;[0, 250]&#125; /&gt;</code> <code class="svelte-1uha8ag"></code> <code class="svelte-1uha8ag"></code></div></div> We could also combine multiple components to create animations. <div class="button-code-group svelte-1uha8ag"><!> <div><code class="svelte-1uha8ag">&lt;Confetti cone x=&#123;[-1, -0.25]&#125; colorRange=&#123;[100, 200]&#125; /&gt;</code> <code class="svelte-1uha8ag">&lt;Confetti cone x=&#123;[-0.35, 0.35]&#125; delay=&#123;[500, 550]&#125; colorRange=&#123;[200, 300]&#125; /&gt;</code> <code class="svelte-1uha8ag">&lt;Confetti cone x=&#123;[0.25, 1]&#125; delay=&#123;[250, 300]&#125; colorRange=&#123;[100, 200]&#125; /&gt;</code> <code class="svelte-1uha8ag"></code></div></div> <div class="button-code-group svelte-1uha8ag"><!> <div><code class="svelte-1uha8ag"></code> <code class="svelte-1uha8ag"></code> <code class="svelte-1uha8ag"></code></div></div></div></div> <div class="block svelte-1uha8ag"><h3 class="svelte-1uha8ag">Styling it further</h3> <div class="description svelte-1uha8ag">We've now looked at all the different properties, but since this is just HTML and CSS you can style it further however you like. Let's look at some fullscreen examples. Having the effect fullscreen is not a simple toggle, but it is a simple bit of CSS. <br/><br/> <div><!> <code class="well svelte-1uha8ag">&lt;div style="<br/> &nbsp;position: fixed;<br/> &nbsp;top: -50px;<br/> &nbsp;left: 0;<br/> &nbsp;height: 100vh;<br/> &nbsp;width: 100vw;<br/> &nbsp;display: flex;<br/> &nbsp;justify-content: center;<br/> &nbsp;overflow: hidden;<br/> &nbsp;pointer-events: none;"&gt;<br/> <br/> &lt;/div&gt;</code></div> <br/> The element is fixed and placed just off screen so we can't see the confetti spawn in. The <mark class="svelte-1uha8ag">fallDistance</mark> property is set to <code class="inline svelte-1uha8ag">100vh</code> so they cover the entire screen. <br/> <br/> One thing you may have noticed is that if you click a button the previous confetti disappears immediately and new ones spawn in. We could change this by creating a new component for each click. Check out the code for this example in the <a target="_blank" href="https://svelte.dev/repl/21a63990161c481d97483c1f1d4de597" class="svelte-1uha8ag">REPL</a>. <br/> <br/> <!> <br/> <br/> <br/> <br/> You could also further style the confetti itself. Don't like the animation? Do it yourself! Target the confetti with <code class="inline svelte-1uha8ag">:global(.confetti)</code> and change the animation using <code class="inline svelte-1uha8ag">animation-name</code>, all values are set as css variables so you can easily use them yourself.</div></div> <h2 class="svelte-1uha8ag">Properties</h2> <div class="block svelte-1uha8ag"><p class="svelte-1uha8ag">This is a list of all configurable properties.</p> <div class="table svelte-1uha8ag"><strong class="svelte-1uha8ag">Property</strong> <strong class="svelte-1uha8ag">Default</strong> <strong class="svelte-1uha8ag">Description</strong> <code class="svelte-1uha8ag">size</code> <code class="svelte-1uha8ag">10</code> <div>The max size in pixels of the individual confetti pieces.</div> <code class="svelte-1uha8ag">x</code> <code class="svelte-1uha8ag">[-0.5, 0.5]</code> <div>The max horizontal range of the confetti pieces. Negative is left, positive is right. [-1, 1] would mean maximum of 200px left and 200px right.</div> <code class="svelte-1uha8ag">y</code> <code class="svelte-1uha8ag">[0.25, 1]</code> <div>The max vertical range of the confetti pieces. Negative is down, positive is up. [-1, 1] would mean maximum of 200px down and 200px up.</div> <code class="svelte-1uha8ag">duration</code> <code class="svelte-1uha8ag">2000</code> <div>Duration of the animation for each individual piece.</div> <code class="svelte-1uha8ag">infinite</code> <code class="svelte-1uha8ag">false</code> <div>If set to true the animation will play indefinitely.</div> <code class="svelte-1uha8ag">delay</code> <code class="svelte-1uha8ag">[0, 50]</code> <div>Used to set a random delay for each piece. A large difference between each number will mean a longer spray time.</div> <code class="svelte-1uha8ag">colorRange</code> <code class="svelte-1uha8ag">[0, 360]</code> <div>Color range on the HSL color wheel. 0 to 360 is full RGB. 75 To 150 would be only green colors.</div> <code class="svelte-1uha8ag">colorArray</code> <code class="svelte-1uha8ag">[]</code> <div>Can be used to pick a random color from this array. Set just one array elements to have a single color. Accepts any viable css background property, including gradients and images.</div> <code class="svelte-1uha8ag">amount</code> <code class="svelte-1uha8ag">50</code> <div>Amount of particles spawned. The larger your spray the more pieces you might want. Be careful with too many as it might impact performance.</div> <code class="svelte-1uha8ag">iterationCount</code> <code class="svelte-1uha8ag">1</code> <div>How many times the animation will play before stopping. Is overwritten by the "infinite" property.</div> <code class="svelte-1uha8ag">fallDistance</code> <code class="svelte-1uha8ag">"100px"</code> <div>How far each piece falls. Accepts any css property, px, rem, vh, etc, but not 0.</div> <code class="svelte-1uha8ag">rounded</code> <code class="svelte-1uha8ag">false</code> <div>Set to true to make each confetti piece rounded.</div> <code class="svelte-1uha8ag">cone</code> <code class="svelte-1uha8ag">false</code> <div>Set to true to make the explosion appear in a cone like shape which might feel more realistic when dealing with a larger amount.</div> <code class="svelte-1uha8ag">noGravity</code> <code class="svelte-1uha8ag">false</code> <div>Set to true to make the particles accelerate at a constant speed without "falling" down. Give it a more explosion like effect.</div> <code class="svelte-1uha8ag">xSpread</code> <code class="svelte-1uha8ag">0.15</code> <div>A number from 0 to 1 that determines how far the particles spread horizontally. A low number will mean the x near the peak and the x near the end are similar.</div> <code class="svelte-1uha8ag">destroyOnComplete</code> <code class="svelte-1uha8ag">true</code> <div>By default the elements are removed when the animation is complete. Set to false to prevent this behaviour.</div> <code class="svelte-1uha8ag">disableForReducedMotion</code> <code class="svelte-1uha8ag">false</code> <div>Disable animations for those with reduced motion preferences.</div></div></div> <div class="block svelte-1uha8ag">Made by <a href="https://github.com/Mitcheljager" class="svelte-1uha8ag">Mitchel Jager</a></div></div>`);

export default function _page($$anchor) {
	var div = root_60();
	var div_1 = $.child(div);
	var h1 = $.child(div_1);
	var node = $.child(h1);

	Confetti(node, {
		infinite: true,
		amount: 10,
		x: [-0.5, -0.25],
		y: [0.25, 0.5],
		delay: [500, 2000],
		colorArray: ["var(--primary)"]
	});

	var node_1 = $.sibling(node, 4);

	Confetti(node_1, {
		infinite: true,
		amount: 10,
		x: [0.25, 0.5],
		y: [0.25, 0.5],
		delay: [500, 2000],
		colorArray: ["white"]
	});

	$.reset(h1);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.sibling($.child(div_2), 8);
	var node_2 = $.child(div_3);

	ToggleConfetti(node_2, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, {});
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button = root();

				$.append($$anchor, button);
			}
		}
	});

	var node_3 = $.sibling(node_2, 2);

	ToggleConfetti(node_3, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { amount: 200 });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_1 = root_1();

				$.append($$anchor, button_1);
			}
		}
	});

	var node_4 = $.sibling(node_3, 2);

	ToggleConfetti(node_4, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { amount: 10 });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_2 = root_2();

				$.append($$anchor, button_2);
			}
		}
	});

	var node_5 = $.sibling(node_4, 2);

	ToggleConfetti(node_5, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { size: 20 });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_3 = root_3();

				$.append($$anchor, button_3);
			}
		}
	});

	var node_6 = $.sibling(node_5, 2);

	ToggleConfetti(node_6, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { rounded: true, size: 15 });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_4 = root_4();

				$.append($$anchor, button_4);
			}
		}
	});

	var node_7 = $.sibling(node_6, 2);

	ToggleConfetti(node_7, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { colorArray: ["var(--primary)"] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_5 = root_5();

				$.append($$anchor, button_5);
			}
		}
	});

	var node_8 = $.sibling(node_7, 2);

	ToggleConfetti(node_8, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { colorArray: ["var(--primary)", "white", "green"] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_6 = root_6();

				$.append($$anchor, button_6);
			}
		}
	});

	var node_9 = $.sibling(node_8, 2);

	ToggleConfetti(node_9, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, {
				size: 20,
				colorArray: [
					"url(https://svelte.dev/favicon.png)",
					"url(https://github.githubassets.com/favicons/favicon-dark.png)"
				]
			});
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_7 = root_7();

				$.append($$anchor, button_7);
			}
		}
	});

	var node_10 = $.sibling(node_9, 2);

	ToggleConfetti(node_10, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, {
				size: 20,
				colorArray: ["linear-gradient(#c8102e, white, #003da5)"]
			});
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_8 = root_8();

				$.append($$anchor, button_8);
			}
		}
	});

	var node_11 = $.sibling(node_10, 2);

	ToggleConfetti(node_11, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_9();
			var node_12 = $.first_child(fragment_9);

			Confetti(node_12, { y: [1.25, 1.5], x: [-1, 1], colorArray: ["#c8102e"] });

			var node_13 = $.sibling(node_12, 2);

			Confetti(node_13, { y: [1, 1.25], x: [-1, 1], colorArray: ["white"] });

			var node_14 = $.sibling(node_13, 2);

			Confetti(node_14, { y: [0.75, 1], x: [-1, 1], colorArray: ["#003da5"] });
			$.append($$anchor, fragment_9);
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_9 = root_10();

				$.append($$anchor, button_9);
			}
		}
	});

	var node_15 = $.sibling(node_11, 2);

	ToggleConfetti(node_15, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { y: [1, 2], x: [-0.25, 0.25] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_10 = root_11();

				$.append($$anchor, button_10);
			}
		}
	});

	var node_16 = $.sibling(node_15, 2);

	ToggleConfetti(node_16, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { y: [0.25, 0.5], x: [-4, 4] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_11 = root_12();

				$.append($$anchor, button_11);
			}
		}
	});

	var node_17 = $.sibling(node_16, 2);

	ToggleConfetti(node_17, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { cone: true });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_12 = root_13();

				$.append($$anchor, button_12);
			}
		}
	});

	var node_18 = $.sibling(node_17, 2);

	ToggleConfetti(node_18, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { y: [-0.5, 0.5], x: [-0.5, 0.5] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_13 = root_14();

				$.append($$anchor, button_13);
			}
		}
	});

	var node_19 = $.sibling(node_18, 2);

	ToggleConfetti(node_19, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { y: [-1, 1], x: [-1, 1], noGravity: true, duration: 750 });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_14 = root_15();

				$.append($$anchor, button_14);
			}
		}
	});

	var node_20 = $.sibling(node_19, 2);

	ToggleConfetti(node_20, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, {
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
			label: ($$anchor, $$slotProps) => {
				var button_15 = root_16();

				$.append($$anchor, button_15);
			}
		}
	});

	var node_21 = $.sibling(node_20, 2);

	ToggleConfetti(node_21, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { delay: [0, 750] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_16 = root_17();

				$.append($$anchor, button_16);
			}
		}
	});

	var node_22 = $.sibling(node_21, 2);

	ToggleConfetti(node_22, {
		children: ($$anchor, $$slotProps) => {
			var fragment_17 = root_9();
			var node_23 = $.first_child(fragment_17);

			Confetti(node_23, { cone: true, x: [-0.5, 0.5] });

			var node_24 = $.sibling(node_23, 2);

			Confetti(node_24, { cone: true, amount: 10, x: [-1, -0.4], y: [0.25, 0.75] });

			var node_25 = $.sibling(node_24, 2);

			Confetti(node_25, { cone: true, amount: 10, x: [0.4, 1], y: [0.25, 0.75] });
			$.append($$anchor, fragment_17);
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_17 = root_18();

				$.append($$anchor, button_17);
			}
		}
	});

	var node_26 = $.sibling(node_22, 2);

	ToggleConfetti(node_26, {
		toggleOnce: true,
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { infinite: true, amount: 20, delay: [0, 500] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_18 = root_19();

				$.append($$anchor, button_18);
			}
		}
	});

	var node_27 = $.sibling(node_26, 2);

	ToggleConfetti(node_27, {
		toggleOnce: true,
		relative: false,
		children: ($$anchor, $$slotProps) => {
			var div_4 = root_20();
			var node_28 = $.child(div_4);

			Confetti(node_28, {
				x: [-5, 5],
				y: [0, 0.1],
				delay: [500, 2000],
				infinite: true,
				duration: 5000,
				amount: 200,
				fallDistance: '100vh'
			});

			$.reset(div_4);
			$.append($$anchor, div_4);
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_19 = root_21();

				$.append($$anchor, button_19);
			}
		}
	});

	$.reset(div_3);

	var node_29 = $.sibling(div_3, 4);

	ConfettiOnClick(node_29, {});

	var node_30 = $.sibling(node_29, 6);

	{
		const svelte4 = ($$anchor) => {
			$.next();

			var fragment_19 = root_22();

			$.next(2);
			$.append($$anchor, fragment_19);
		};

		const svelte5 = ($$anchor) => {
			$.next();

			var fragment_20 = root_23();

			$.next(2);
			$.append($$anchor, fragment_20);
		};

		CodeBlock(node_30, { svelte4, svelte5, $$slots: { svelte4: true, svelte5: true } });
	}

	var node_31 = $.sibling(node_30, 2);

	{
		const svelte4 = ($$anchor) => {
			$.next();

			var fragment_21 = root_24();

			$.next(2);
			$.append($$anchor, fragment_21);
		};

		const svelte5 = ($$anchor) => {
			$.next();

			var fragment_22 = root_25();

			$.next(2);
			$.append($$anchor, fragment_22);
		};

		CodeBlock(node_31, { svelte4, svelte5, $$slots: { svelte4: true, svelte5: true } });
	}

	$.next(6);
	$.reset(div_2);

	var div_5 = $.sibling(div_2, 6);
	var div_6 = $.child(div_5);
	var div_7 = $.sibling($.child(div_6));
	var node_32 = $.child(div_7);

	ToggleConfetti(node_32, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, {});
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_20 = root();

				$.append($$anchor, button_20);
			}
		}
	});

	$.next(2);
	$.reset(div_7);
	$.reset(div_6);
	$.reset(div_5);

	var div_8 = $.sibling(div_5, 2);
	var div_9 = $.sibling($.child(div_8), 2);
	var div_10 = $.sibling($.child(div_9), 5);
	var node_33 = $.child(div_10);

	ToggleConfetti(node_33, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { x: [-0.5, 0.5], y: [0.25, 1] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_21 = root();

				$.append($$anchor, button_21);
			}
		}
	});

	$.next(2);
	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var node_34 = $.child(div_11);

	ToggleConfetti(node_34, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { x: [-1, -0.25], y: [0, 0.5] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_22 = root_26();

				$.append($$anchor, button_22);
			}
		}
	});

	$.next(2);
	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var node_35 = $.child(div_12);

	ToggleConfetti(node_35, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { x: [0.25, 1], y: [0, 0.5] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_23 = root_27();

				$.append($$anchor, button_23);
			}
		}
	});

	$.next(2);
	$.reset(div_12);

	var div_13 = $.sibling(div_12, 2);
	var node_36 = $.child(div_13);

	ToggleConfetti(node_36, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { x: [-0.25, 0.25], y: [0.75, 1.5] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_24 = root_28();

				$.append($$anchor, button_24);
			}
		}
	});

	$.next(2);
	$.reset(div_13);

	var div_14 = $.sibling(div_13, 2);
	var node_37 = $.child(div_14);

	ToggleConfetti(node_37, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { x: [-0.25, 0.25], y: [-0.75, -0.25] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_25 = root_29();

				$.append($$anchor, button_25);
			}
		}
	});

	$.next(2);
	$.reset(div_14);

	var div_15 = $.sibling(div_14, 2);
	var node_38 = $.child(div_15);

	ToggleConfetti(node_38, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { x: [-0.5, 0.5], y: [-0.5, 0.5] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_26 = root_30();

				$.append($$anchor, button_26);
			}
		}
	});

	$.next(2);
	$.reset(div_15);
	$.reset(div_9);
	$.reset(div_8);

	var div_16 = $.sibling(div_8, 2);
	var div_17 = $.sibling($.child(div_16), 2);
	var div_18 = $.sibling($.child(div_17), 3);
	var node_39 = $.child(div_18);

	ToggleConfetti(node_39, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { amount: 10 });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_27 = root_2();

				$.append($$anchor, button_27);
			}
		}
	});

	$.next(2);
	$.reset(div_18);

	var div_19 = $.sibling(div_18, 2);
	var node_40 = $.child(div_19);

	ToggleConfetti(node_40, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { amount: 50 });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_28 = root();

				$.append($$anchor, button_28);
			}
		}
	});

	$.next(2);
	$.reset(div_19);

	var div_20 = $.sibling(div_19, 2);
	var node_41 = $.child(div_20);

	ToggleConfetti(node_41, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { amount: 200 });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_29 = root_1();

				$.append($$anchor, button_29);
			}
		}
	});

	$.next(2);
	$.reset(div_20);

	var div_21 = $.sibling(div_20, 2);
	var node_42 = $.child(div_21);

	ToggleConfetti(node_42, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { amount: 500 });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_30 = root_31();

				$.append($$anchor, button_30);
			}
		}
	});

	$.next(2);
	$.reset(div_21);
	$.reset(div_17);
	$.reset(div_16);

	var div_22 = $.sibling(div_16, 2);
	var div_23 = $.sibling($.child(div_22), 2);
	var div_24 = $.sibling($.child(div_23), 3);
	var node_43 = $.child(div_24);

	ToggleConfetti(node_43, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { amount: 200 });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_31 = root();

				$.append($$anchor, button_31);
			}
		}
	});

	var code = $.sibling(node_43, 2);

	code.textContent = '<Confetti amount=200 />';
	$.reset(div_24);

	var div_25 = $.sibling(div_24, 2);
	var node_44 = $.child(div_25);

	ToggleConfetti(node_44, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { cone: true, amount: 200 });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_32 = root_13();

				$.append($$anchor, button_32);
			}
		}
	});

	var code_1 = $.sibling(node_44, 2);
	var text = $.sibling($.child(code_1), 2);

	text.nodeValue = ' amount=200 />';
	$.reset(code_1);
	$.reset(div_25);

	var div_26 = $.sibling(div_25, 2);
	var node_45 = $.child(div_26);

	ToggleConfetti(node_45, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { x: [0.25, 1], y: [0, 0.5] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_33 = root_27();

				$.append($$anchor, button_33);
			}
		}
	});

	$.next(2);
	$.reset(div_26);

	var div_27 = $.sibling(div_26, 2);
	var node_46 = $.child(div_27);

	ToggleConfetti(node_46, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { cone: true, x: [1, 2.5], y: [0.25, 0.75] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_34 = root_32();

				$.append($$anchor, button_34);
			}
		}
	});

	$.next(2);
	$.reset(div_27);
	$.next();
	$.reset(div_23);
	$.reset(div_22);

	var div_28 = $.sibling(div_22, 2);
	var div_29 = $.sibling($.child(div_28), 2);
	var div_30 = $.sibling($.child(div_29), 3);
	var node_47 = $.child(div_30);

	ToggleConfetti(node_47, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { size: 2 });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_35 = root_33();

				$.append($$anchor, button_35);
			}
		}
	});

	$.next(2);
	$.reset(div_30);

	var div_31 = $.sibling(div_30, 2);
	var node_48 = $.child(div_31);

	ToggleConfetti(node_48, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { size: 30 });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_36 = root_34();

				$.append($$anchor, button_36);
			}
		}
	});

	$.next(2);
	$.reset(div_31);

	var div_32 = $.sibling(div_31, 4);
	var node_49 = $.child(div_32);

	ToggleConfetti(node_49, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { rounded: true, size: 30 });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_37 = root_35();

				$.append($$anchor, button_37);
			}
		}
	});

	var code_2 = $.sibling(node_49, 2);
	var text_1 = $.sibling($.child(code_2), 2);

	text_1.nodeValue = ' size=30 />';
	$.reset(code_2);
	$.reset(div_32);
	$.reset(div_29);
	$.reset(div_28);

	var div_33 = $.sibling(div_28, 2);
	var div_34 = $.sibling($.child(div_33), 2);
	var div_35 = $.sibling($.child(div_34), 3);
	var node_50 = $.child(div_35);

	ToggleConfetti(node_50, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { delay: [0, 250] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_38 = root_36();

				$.append($$anchor, button_38);
			}
		}
	});

	$.next(2);
	$.reset(div_35);

	var div_36 = $.sibling(div_35, 2);
	var node_51 = $.child(div_36);

	ToggleConfetti(node_51, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { delay: [0, 1500] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_39 = root_37();

				$.append($$anchor, button_39);
			}
		}
	});

	$.next(2);
	$.reset(div_36);

	var div_37 = $.sibling(div_36, 4);
	var node_52 = $.child(div_37);

	ToggleConfetti(node_52, {
		toggleOnce: true,
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { infinite: true });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_40 = root();

				$.append($$anchor, button_40);
			}
		}
	});

	$.next(2);
	$.reset(div_37);

	var div_38 = $.sibling(div_37, 2);
	var node_53 = $.child(div_38);

	ToggleConfetti(node_53, {
		toggleOnce: true,
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { infinite: true, delay: [0, 1500] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_41 = root_37();

				$.append($$anchor, button_41);
			}
		}
	});

	$.next(2);
	$.reset(div_38);

	var div_39 = $.sibling(div_38, 4);
	var node_54 = $.child(div_39);

	ToggleConfetti(node_54, {
		toggleOnce: true,
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { iterationCount: 'infinite' });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_42 = root_38();

				$.append($$anchor, button_42);
			}
		}
	});

	$.next(2);
	$.reset(div_39);
	$.reset(div_34);
	$.reset(div_33);

	var div_40 = $.sibling(div_33, 2);
	var div_41 = $.sibling($.child(div_40), 2);
	var div_42 = $.sibling($.child(div_41), 5);
	var node_55 = $.child(div_42);

	ToggleConfetti(node_55, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { colorRange: [75, 175] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_43 = root_39();

				$.append($$anchor, button_43);
			}
		}
	});

	$.next(2);
	$.reset(div_42);

	var div_43 = $.sibling(div_42, 2);
	var node_56 = $.child(div_43);

	ToggleConfetti(node_56, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, {
				colorArray: ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"]
			});
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_44 = root_40();

				$.append($$anchor, button_44);
			}
		}
	});

	$.next(2);
	$.reset(div_43);

	var div_44 = $.sibling(div_43, 2);
	var node_57 = $.child(div_44);

	ToggleConfetti(node_57, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, {
				colorArray: ["var(--primary)", "rgba(0, 255, 0, 0.5)", "white"]
			});
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_45 = root_41();

				$.append($$anchor, button_45);
			}
		}
	});

	$.next(2);
	$.reset(div_44);

	var div_45 = $.sibling(div_44, 2);
	var node_58 = $.child(div_45);

	ToggleConfetti(node_58, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, {
				size: 20,
				colorArray: ["linear-gradient(var(--primary), blue)"]
			});
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_46 = root_8();

				$.append($$anchor, button_46);
			}
		}
	});

	$.next(2);
	$.reset(div_45);

	var div_46 = $.sibling(div_45, 2);
	var node_59 = $.child(div_46);

	ToggleConfetti(node_59, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, {
				size: 20,
				colorArray: [
					"url(https://svelte.dev/favicon.png)",
					"url(https://github.githubassets.com/favicons/favicon-dark.png)"
				]
			});
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_47 = root_7();

				$.append($$anchor, button_47);
			}
		}
	});

	$.next(2);
	$.reset(div_46);

	var div_47 = $.sibling(div_46, 2);
	var node_60 = $.child(div_47);

	ToggleConfetti(node_60, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, {
				colorArray: [`hsl(${Math.floor(Math.random() * 360)}, 75%, 50%)`]
			});
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_48 = root_42();

				$.append($$anchor, button_48);
			}
		}
	});

	$.next(2);
	$.reset(div_47);
	$.reset(div_41);
	$.reset(div_40);

	var div_48 = $.sibling(div_40, 2);
	var div_49 = $.sibling($.child(div_48), 2);
	var div_50 = $.sibling($.child(div_49), 3);
	var node_61 = $.child(div_50);

	ToggleConfetti(node_61, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { fallDistance: '50px' });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_49 = root_43();

				$.append($$anchor, button_49);
			}
		}
	});

	$.next(2);
	$.reset(div_50);

	var div_51 = $.sibling(div_50, 2);
	var node_62 = $.child(div_51);

	ToggleConfetti(node_62, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { fallDistance: '200px' });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_50 = root_44();

				$.append($$anchor, button_50);
			}
		}
	});

	$.next(2);
	$.reset(div_51);

	var div_52 = $.sibling(div_51, 2);
	var node_63 = $.child(div_52);

	ToggleConfetti(node_63, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { fallDistance: '0px' });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var div_53 = root_45();

				$.append($$anchor, div_53);
			}
		}
	});

	$.next(2);
	$.reset(div_52);

	var div_54 = $.sibling(div_52, 4);
	var node_64 = $.child(div_54);

	ToggleConfetti(node_64, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { noGravity: true, duration: 500 });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_51 = root_46();

				$.append($$anchor, button_51);
			}
		}
	});

	var code_3 = $.sibling(node_64, 2);
	var text_2 = $.sibling($.child(code_3), 2);

	text_2.nodeValue = ' duration=500 />';
	$.reset(code_3);
	$.reset(div_54);

	var div_55 = $.sibling(div_54, 2);
	var node_65 = $.child(div_55);

	ToggleConfetti(node_65, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, {
				noGravity: true,
				duration: 500,
				x: [-0.5, 0.5],
				y: [-0.5, 0.5]
			});
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_52 = root_47();

				$.append($$anchor, button_52);
			}
		}
	});

	var code_4 = $.sibling(node_65, 2);
	var text_3 = $.sibling($.child(code_4), 2);

	text_3.nodeValue = ' duration=500 x={[-0.5, 0.5]} y={[-0.5, 0.5]} />';
	$.reset(code_4);
	$.reset(div_55);

	var div_56 = $.sibling(div_55, 4);
	var node_66 = $.child(div_56);

	ToggleConfetti(node_66, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { xSpread: 0.1 });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_53 = root_48();

				$.append($$anchor, button_53);
			}
		}
	});

	$.next(2);
	$.reset(div_56);

	var div_57 = $.sibling(div_56, 2);
	var node_67 = $.child(div_57);

	ToggleConfetti(node_67, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { xSpread: 0.4 });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_54 = root_49();

				$.append($$anchor, button_54);
			}
		}
	});

	$.next(2);
	$.reset(div_57);
	$.reset(div_49);
	$.reset(div_48);

	var div_58 = $.sibling(div_48, 2);
	var div_59 = $.sibling($.child(div_58), 2);
	var div_60 = $.sibling($.child(div_59), 8);
	var node_68 = $.child(div_60);

	ToggleConfetti(node_68, {
		children: ($$anchor, $$slotProps) => {
			var fragment_59 = root_9();
			var node_69 = $.first_child(fragment_59);

			Confetti(node_69, { y: [1.25, 1.5], x: [-1, 1], colorArray: ["#c8102e"] });

			var node_70 = $.sibling(node_69, 2);

			Confetti(node_70, { y: [1, 1.25], x: [-1, 1], colorArray: ["white"] });

			var node_71 = $.sibling(node_70, 2);

			Confetti(node_71, { y: [0.75, 1], x: [-1, 1], colorArray: ["#3350ec"] });
			$.append($$anchor, fragment_59);
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_55 = root_50();

				$.append($$anchor, button_55);
			}
		}
	});

	$.next(2);
	$.reset(div_60);

	var div_61 = $.sibling(div_60, 4);
	var node_72 = $.child(div_61);

	ToggleConfetti(node_72, {
		children: ($$anchor, $$slotProps) => {
			var fragment_60 = root_9();
			var node_73 = $.first_child(fragment_60);

			Confetti(node_73, {
				y: [0.75, 1.5],
				x: [-1, 1],
				colorArray: ["#3350ec"],
				amount: 100
			});

			var node_74 = $.sibling(node_73, 2);

			Confetti(node_74, {
				y: [1.05, 1.20],
				x: [-1, 1],
				colorArray: ["#ffcd00"],
				amount: 50
			});

			var node_75 = $.sibling(node_74, 2);

			Confetti(node_75, {
				y: [0.75, 1.5],
				x: [-0.5, -0.25],
				colorArray: ["#ffcd00"],
				amount: 20
			});

			$.append($$anchor, fragment_60);
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_56 = root_51();

				$.append($$anchor, button_56);
			}
		}
	});

	var code_5 = $.sibling(node_72, 2);
	var text_4 = $.child(code_5);

	text_4.nodeValue = '<Confetti y={[0.75, 1.5]} x={[-1, 1]} colorArray={["#004b87"]} amount=100 /> ';

	var text_5 = $.sibling(text_4, 2);

	text_5.nodeValue = ' <Confetti y={[1.05, 1.20]} x={[-1, 1]} colorArray={["#ffcd00"]} amount=50 /> ';

	var text_6 = $.sibling(text_5, 2);

	text_6.nodeValue = ' <Confetti y={[0.75, 1.5]} x={[-0.5, -0.25]} colorArray={["#ffcd00"]} amount=20 /> ';
	$.next();
	$.reset(code_5);
	$.reset(div_61);

	var div_62 = $.sibling(div_61, 4);
	var node_76 = $.child(div_62);

	ToggleConfetti(node_76, {
		children: ($$anchor, $$slotProps) => {
			var fragment_61 = root_52();
			var node_77 = $.first_child(fragment_61);

			Confetti(node_77, {
				y: [1.15, 1.5],
				x: [-1, -0.25],
				colorArray: ["#3350ec"],
				amount: 100
			});

			var node_78 = $.sibling(node_77, 2);

			Confetti(node_78, {
				y: [1.20, 1.45],
				x: [-0.95, -0.3],
				colorArray: ["white"],
				size: 5
			});

			var node_79 = $.sibling(node_78, 2);

			Confetti(node_79, {
				y: [1.45, 1.5],
				x: [-0.25, 1],
				colorArray: ["#bf0d3e"],
				amount: 70
			});

			var node_80 = $.sibling(node_79, 2);

			Confetti(node_80, {
				y: [1.4, 1.45],
				x: [-0.25, 1],
				colorArray: ["white"],
				amount: 70
			});

			var node_81 = $.sibling(node_80, 2);

			Confetti(node_81, {
				y: [1.35, 1.4],
				x: [-0.25, 1],
				colorArray: ["#bf0d3e"],
				amount: 70
			});

			var node_82 = $.sibling(node_81, 2);

			Confetti(node_82, {
				y: [1.3, 1.35],
				x: [-0.25, 1],
				colorArray: ["white"],
				amount: 70
			});

			var node_83 = $.sibling(node_82, 2);

			Confetti(node_83, {
				y: [1.25, 1.3],
				x: [-0.25, 1],
				colorArray: ["#bf0d3e"],
				amount: 70
			});

			var node_84 = $.sibling(node_83, 2);

			Confetti(node_84, {
				y: [1.2, 1.25],
				x: [-0.25, 1],
				colorArray: ["white"],
				amount: 70
			});

			var node_85 = $.sibling(node_84, 2);

			Confetti(node_85, {
				y: [1.15, 1.2],
				x: [-0.25, 1],
				colorArray: ["#bf0d3e"],
				amount: 70
			});

			var node_86 = $.sibling(node_85, 2);

			Confetti(node_86, {
				y: [1.1, 1.15],
				x: [-1, 1],
				colorArray: ["white"],
				amount: 70
			});

			var node_87 = $.sibling(node_86, 2);

			Confetti(node_87, {
				y: [1.05, 1.1],
				x: [-1, 1],
				colorArray: ["#bf0d3e"],
				amount: 70
			});

			var node_88 = $.sibling(node_87, 2);

			Confetti(node_88, { y: [1, 1.05], x: [-1, 1], colorArray: ["white"], amount: 70 });

			var node_89 = $.sibling(node_88, 2);

			Confetti(node_89, {
				y: [0.95, 1],
				x: [-1, 1],
				colorArray: ["#bf0d3e"],
				amount: 70
			});

			var node_90 = $.sibling(node_89, 2);

			Confetti(node_90, {
				y: [0.9, 0.95],
				x: [-1, 1],
				colorArray: ["white"],
				amount: 70
			});

			var node_91 = $.sibling(node_90, 2);

			Confetti(node_91, {
				y: [0.85, 0.9],
				x: [-1, 1],
				colorArray: ["#bf0d3e"],
				amount: 70
			});

			$.append($$anchor, fragment_61);
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var div_63 = root_53();

				$.append($$anchor, div_63);
			}
		}
	});

	var code_6 = $.sibling(node_76, 4);
	var text_7 = $.child(code_6);

	text_7.nodeValue = '<Confetti y={[1.20, 1.45]} x={[-0.95, -0.3]} colorArray={["white"]} size=5 /> ';

	var text_8 = $.sibling(text_7, 2);

	text_8.nodeValue = ' <Confetti y={[1.45, 1.5]} x={[-0.25, 1]} colorArray={["#bf0d3e"]} amount=70 /> ';

	var text_9 = $.sibling(text_8, 2);

	text_9.nodeValue = ' <Confetti y={[1.4, 1.45]} x={[-0.25, 1]} colorArray={["white"]} amount=70 /> ';

	var text_10 = $.sibling(text_9, 2);

	text_10.nodeValue = ' <Confetti y={[1.35, 1.4]} x={[-0.25, 1]} colorArray={["#bf0d3e"]} amount=70 /> ';

	var text_11 = $.sibling(text_10, 2);

	text_11.nodeValue = ' <Confetti y={[1.3, 1.35]} x={[-0.25, 1]} colorArray={["white"]} amount=70 /> ';

	var text_12 = $.sibling(text_11, 2);

	text_12.nodeValue = ' <Confetti y={[1.25, 1.3]} x={[-0.25, 1]} colorArray={["#bf0d3e"]} amount=70 /> ';

	var text_13 = $.sibling(text_12, 2);

	text_13.nodeValue = ' <Confetti y={[1.2, 1.25]} x={[-0.25, 1]} colorArray={["white"]} amount=70 /> ';

	var text_14 = $.sibling(text_13, 2);

	text_14.nodeValue = ' <Confetti y={[1.15, 1.2]} x={[-0.25, 1]} colorArray={["#bf0d3e"]} amount=70 /> ';

	var text_15 = $.sibling(text_14, 2);

	text_15.nodeValue = ' <Confetti y={[1.1, 1.15]} x={[-1, 1]} colorArray={["white"]} amount=70 /> ';

	var text_16 = $.sibling(text_15, 2);

	text_16.nodeValue = ' <Confetti y={[1.05, 1.1]} x={[-1, 1]} colorArray={["#bf0d3e"]} amount=70 /> ';

	var text_17 = $.sibling(text_16, 2);

	text_17.nodeValue = ' <Confetti y={[1, 1.05]} x={[-1, 1]} colorArray={["white"]} amount=70 /> ';

	var text_18 = $.sibling(text_17, 2);

	text_18.nodeValue = ' <Confetti y={[0.95, 1]} x={[-1, 1]} colorArray={["#bf0d3e"]} amount=70 /> ';

	var text_19 = $.sibling(text_18, 2);

	text_19.nodeValue = ' <Confetti y={[0.9, 0.95]} x={[-1, 1]} colorArray={["white"]} amount=70 /> ';

	var text_20 = $.sibling(text_19, 2);

	text_20.nodeValue = ' <Confetti y={[0.85, 0.9]} x={[-1, 1]} colorArray={["#bf0d3e"]} amount=70 /> ';
	$.next();
	$.reset(code_6);
	$.reset(div_62);

	var div_64 = $.sibling(div_62, 4);
	var node_92 = $.child(div_64);

	ToggleConfetti(node_92, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { amount: 70, x: [-0.5, 0.5] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_57 = root_54();

				$.append($$anchor, button_57);
			}
		}
	});

	$.next(2);
	$.reset(div_64);

	var div_65 = $.sibling(div_64, 2);
	var node_93 = $.child(div_65);

	ToggleConfetti(node_93, {
		children: ($$anchor, $$slotProps) => {
			var fragment_63 = root_9();
			var node_94 = $.first_child(fragment_63);

			Confetti(node_94, { x: [-0.5, 0.5] });

			var node_95 = $.sibling(node_94, 2);

			Confetti(node_95, { amount: 10, x: [-0.75, -0.3], y: [0.15, 0.75] });

			var node_96 = $.sibling(node_95, 2);

			Confetti(node_96, { amount: 10, x: [0.3, 0.75], y: [0.15, 0.75] });
			$.append($$anchor, fragment_63);
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_58 = root_18();

				$.append($$anchor, button_58);
			}
		}
	});

	var div_66 = $.sibling(node_93, 2);
	var code_7 = $.sibling($.child(div_66), 2);

	code_7.textContent = '<Confetti amount=10 x={[-0.75, -0.3]} y={[0.15, 0.75]} />';

	var code_8 = $.sibling(code_7, 2);

	code_8.textContent = '<Confetti amount=10 x={[0.3, 0.75]} y={[0.15, 0.75]} />';
	$.reset(div_66);
	$.reset(div_65);

	var div_67 = $.sibling(div_65, 2);
	var node_97 = $.child(div_67);

	ToggleConfetti(node_97, {
		children: ($$anchor, $$slotProps) => {
			Confetti($$anchor, { cone: true, amount: 70, x: [-0.5, 0.5] });
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_59 = root_13();

				$.append($$anchor, button_59);
			}
		}
	});

	var div_68 = $.sibling(node_97, 2);
	var code_9 = $.child(div_68);

	code_9.textContent = '<Confetti cone amount=70 x={[-0.5, 0.5]} />';
	$.reset(div_68);
	$.reset(div_67);

	var div_69 = $.sibling(div_67, 2);
	var node_98 = $.child(div_69);

	ToggleConfetti(node_98, {
		children: ($$anchor, $$slotProps) => {
			var fragment_65 = root_9();
			var node_99 = $.first_child(fragment_65);

			Confetti(node_99, { cone: true, x: [-0.5, 0.5] });

			var node_100 = $.sibling(node_99, 2);

			Confetti(node_100, { cone: true, amount: 10, x: [-0.75, -0.4], y: [0.15, 0.75] });

			var node_101 = $.sibling(node_100, 2);

			Confetti(node_101, { cone: true, amount: 10, x: [0.4, 0.75], y: [0.15, 0.75] });
			$.append($$anchor, fragment_65);
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_60 = root_55();

				$.append($$anchor, button_60);
			}
		}
	});

	var div_70 = $.sibling(node_98, 2);
	var code_10 = $.sibling($.child(div_70), 2);

	code_10.textContent = '<Confetti cone amount=10 x={[-0.75, -0.4]} y={[0.15, 0.75]} />';

	var code_11 = $.sibling(code_10, 2);

	code_11.textContent = '<Confetti cone amount=10 x={[0.4, 0.75]} y={[0.15, 0.75]} />';
	$.reset(div_70);
	$.reset(div_69);

	var div_71 = $.sibling(div_69, 2);
	var node_102 = $.child(div_71);

	ToggleConfetti(node_102, {
		children: ($$anchor, $$slotProps) => {
			var fragment_66 = root_9();
			var node_103 = $.first_child(fragment_66);

			Confetti(node_103, { x: [-0.5, 0.5], delay: [0, 250] });

			var node_104 = $.sibling(node_103, 2);

			Confetti(node_104, {
				amount: 10,
				x: [-0.75, -0.3],
				y: [0.15, 0.75],
				delay: [0, 1000]
			});

			var node_105 = $.sibling(node_104, 2);

			Confetti(node_105, {
				amount: 10,
				x: [0.3, 0.75],
				y: [0.15, 0.75],
				delay: [0, 1000]
			});

			$.append($$anchor, fragment_66);
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_61 = root_56();

				$.append($$anchor, button_61);
			}
		}
	});

	var div_72 = $.sibling(node_102, 2);
	var code_12 = $.sibling($.child(div_72), 2);

	code_12.textContent = '<Confetti amount=10 x={[-0.75, -0.3]} y={[0.15, 0.75]} delay={[0, 1000]} />';

	var code_13 = $.sibling(code_12, 2);

	code_13.textContent = '<Confetti amount=10 x={[0.3, 0.75]} y={[0.15, 0.75]} delay={[0, 1000]} />';
	$.reset(div_72);
	$.reset(div_71);

	var div_73 = $.sibling(div_71, 2);
	var node_106 = $.child(div_73);

	ToggleConfetti(node_106, {
		children: ($$anchor, $$slotProps) => {
			var fragment_67 = root_57();
			var node_107 = $.first_child(fragment_67);

			Confetti(node_107, { cone: true, x: [-1, -0.25], colorRange: [100, 200] });

			var node_108 = $.sibling(node_107, 2);

			Confetti(node_108, {
				cone: true,
				x: [-0.35, 0.35],
				delay: [500, 550],
				colorRange: [200, 300]
			});

			var node_109 = $.sibling(node_108, 2);

			Confetti(node_109, {
				cone: true,
				x: [0.25, 1],
				delay: [250, 300],
				colorRange: [100, 200]
			});

			var node_110 = $.sibling(node_109, 2);

			Confetti(node_110, {
				cone: true,
				amount: 20,
				x: [-1, 1],
				y: [0, 1],
				delay: [0, 550],
				colorRange: [200, 300]
			});

			$.append($$anchor, fragment_67);
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_62 = root_58();

				$.append($$anchor, button_62);
			}
		}
	});

	var div_74 = $.sibling(node_106, 2);
	var code_14 = $.sibling($.child(div_74), 6);

	code_14.textContent = '<Confetti cone amount=20 x={[-1, 1]} y={[0, 1]} delay={[0, 550]} colorRange={[200, 300]} />';
	$.reset(div_74);
	$.reset(div_73);

	var div_75 = $.sibling(div_73, 2);
	var node_111 = $.child(div_75);

	ToggleConfetti(node_111, {
		children: ($$anchor, $$slotProps) => {
			var fragment_68 = root_9();
			var node_112 = $.first_child(fragment_68);

			Confetti(node_112, {
				noGravity: true,
				x: [-1, 1],
				y: [-1, 1],
				delay: [0, 50],
				duration: 1000,
				colorRange: [0, 120]
			});

			var node_113 = $.sibling(node_112, 2);

			Confetti(node_113, {
				noGravity: true,
				x: [-1, 1],
				y: [-1, 1],
				delay: [550, 550],
				duration: 1000,
				colorRange: [120, 240]
			});

			var node_114 = $.sibling(node_113, 2);

			Confetti(node_114, {
				noGravity: true,
				x: [-1, 1],
				y: [-1, 1],
				delay: [1000, 1050],
				duration: 1000,
				colorRange: [240, 360]
			});

			$.append($$anchor, fragment_68);
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_63 = root_59();

				$.append($$anchor, button_63);
			}
		}
	});

	var div_76 = $.sibling(node_111, 2);
	var code_15 = $.child(div_76);

	code_15.textContent = '<Confetti noGravity x={[-1, 1]} y={[-1, 1]} delay={[0, 50]} duration=1000 colorRange={[0, 120]} />';

	var code_16 = $.sibling(code_15, 2);

	code_16.textContent = '<Confetti noGravity x={[-1, 1]} y={[-1, 1]} delay={[550, 550]} duration=1000 colorRange={[120, 240]} />';

	var code_17 = $.sibling(code_16, 2);

	code_17.textContent = '<Confetti noGravity x={[-1, 1]} y={[-1, 1]} delay={[1000, 1050]} duration=1000 colorRange={[240, 360]} />';
	$.reset(div_76);
	$.reset(div_75);
	$.reset(div_59);
	$.reset(div_58);

	var div_77 = $.sibling(div_58, 2);
	var div_78 = $.sibling($.child(div_77), 2);
	var div_79 = $.sibling($.child(div_78), 4);
	var node_115 = $.child(div_79);

	ToggleConfetti(node_115, {
		toggleOnce: true,
		relative: false,
		children: ($$anchor, $$slotProps) => {
			var div_80 = root_20();
			var node_116 = $.child(div_80);

			Confetti(node_116, {
				x: [-5, 5],
				y: [0, 0.1],
				delay: [500, 2000],
				infinite: true,
				duration: 5000,
				amount: 200,
				fallDistance: '100vh'
			});

			$.reset(div_80);
			$.append($$anchor, div_80);
		},

		$$slots: {
			default: true,
			label: ($$anchor, $$slotProps) => {
				var button_64 = root_21();

				$.append($$anchor, button_64);
			}
		}
	});

	var code_18 = $.sibling(node_115, 2);
	var text_21 = $.sibling($.child(code_18), 20);

	text_21.nodeValue = '  <Confetti x={[-5, 5]} y={[0, 0.1]} delay={[500, 2000]} infinite duration=5000 amount=200 fallDistance="100vh" /> ';
	$.next(2);
	$.reset(code_18);
	$.reset(div_79);

	var node_117 = $.sibling(div_79, 18);

	ConfettiOnClick(node_117, {});
	$.next(13);
	$.reset(div_78);
	$.reset(div_77);
	$.next(6);
	$.reset(div);
	$.append($$anchor, div);
}