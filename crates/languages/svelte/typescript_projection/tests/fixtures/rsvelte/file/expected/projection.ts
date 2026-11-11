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
const File__SvelteComponent_ = __rsvelte_export_component<{ header?: File }, {}, "">();
type File__SvelteComponent_ = ReturnType<typeof File__SvelteComponent_>;
export default File__SvelteComponent_;
