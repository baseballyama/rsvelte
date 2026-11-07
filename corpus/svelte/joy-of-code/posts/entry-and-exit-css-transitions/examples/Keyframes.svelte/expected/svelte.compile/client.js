import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Sandbox } from '@sveltecraft/sandbox';

var root = $.from_html(`<div class="sandbox svelte-1wse75o"><!></div>`);

export default function Keyframes($$anchor) {
	var div = root();
	var node = $.child(div);

	Sandbox(node, {
		height: 400,
		code: {
			html: `
				<h2>@keyframes</h2>

				<div class="boxes">
					<div class="box"></div>
					<div class="box"></div>
					<div class="box"></div>
					<div class="box"></div>
				</div>
			`,

			css: `
				body {
					display: grid;
					place-content: center;
				}

				@keyframes fadeIn {
					from {
						opacity: 0;
						translate: 0 20px;
					}
					to {
						opacity: 1;
						translate: 0 0;
					}
				}

				.boxes {
					display: flex;
					gap: 0.5rem;

					.box {
						width: clamp(60px, 20dvw, 100px);
						height: clamp(60px, 20dvw, 100px);
						background: #00ffcc;
						border-radius: 0.5rem;
						animation: fadeIn 0.8s backwards;
						animation-delay: calc(0.3s * sibling-index());
					}
				}
			`
		}
	});

	$.reset(div);
	$.append($$anchor, div);
}