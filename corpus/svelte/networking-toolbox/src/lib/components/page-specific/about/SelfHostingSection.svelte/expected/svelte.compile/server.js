import * as $ from 'svelte/internal/server';
import { site } from '$lib/constants/site';

export default function SelfHostingSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<section id="self-hosting"><h2>Self-Hosting</h2> <p>${$.escape(site.title)} can be easily deployed to your own server. Just run the following command:</p> <div class="code"><code>docker run -p 8080:3000 lissy93/networking-toolbox</code></div> <p>You can also checkout our <a href="https://github.com/Lissy93/networking-toolbox/blob/main/docker-compose.yml"><code>docker-compose.yml</code></a>, using the <a href="https://hub.docker.com/r/lissy93/networking-toolbox"><code>lissy93/networking-toolbox</code></a> image from
    DockerHub.</p> <blockquote class="svelte-1ejgaam"><b>Not using Docker, or don't have a server?</b> We support other free hosting options, just take a look at our <a href="/about/deploying">Deployment Docs</a>.</blockquote></section>`);
	});
}