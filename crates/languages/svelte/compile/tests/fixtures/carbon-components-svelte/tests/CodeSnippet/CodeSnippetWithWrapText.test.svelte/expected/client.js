import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";

export default function CodeSnippetWithWrapText_test($$anchor) {
	CodeSnippet($$anchor, {
		type: 'multi',
		wrapText: true,
		code: `node -v
npm -v
yarn -v
git --version
python --version
java -version
docker --version
kubectl version`
	});
}