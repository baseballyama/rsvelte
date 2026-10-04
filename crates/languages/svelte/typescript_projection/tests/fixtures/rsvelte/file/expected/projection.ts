;

	import { type Snippet as File } from 'svelte';

	let { header }: { header?: File } = $props();

;

() => {
  {
    svelteHTML.createElement("p", {});
    (header ? 'with header' : 'no header');
  }
};
export default __rsvelte_export_component<{ header?: File }, {}, "">();
