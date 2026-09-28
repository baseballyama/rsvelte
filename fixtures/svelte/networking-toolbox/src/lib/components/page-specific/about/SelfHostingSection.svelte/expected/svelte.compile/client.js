import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { site } from '$lib/constants/site';

var root = $.from_html(`<section id="self-hosting"><h2>Self-Hosting</h2> <p> </p> <div class="code"><code>docker run -p 8080:3000 lissy93/networking-toolbox</code></div> <p>You can also checkout our <a href="https://github.com/Lissy93/networking-toolbox/blob/main/docker-compose.yml"><code>docker-compose.yml</code></a>, using the <a href="https://hub.docker.com/r/lissy93/networking-toolbox"><code>lissy93/networking-toolbox</code></a> image from
    DockerHub.</p> <blockquote class="svelte-1ejgaam"><b>Not using Docker, or don't have a server?</b> We support other free hosting options, just take a look at our <a href="/about/deploying">Deployment Docs</a>.</blockquote></section>`);

export default function SelfHostingSection($$anchor, $$props) {
	$.push($$props, true);

	var section = root();
	var p = $.sibling($.child(section), 2);
	var text = $.only_child(p);

	$.next(6);
	$.reset(section);
	$.template_effect(() => $.set_text(text, `${site.title ?? ''} can be easily deployed to your own server. Just run the following command:`));
	$.append($$anchor, section);
	$.pop();
}