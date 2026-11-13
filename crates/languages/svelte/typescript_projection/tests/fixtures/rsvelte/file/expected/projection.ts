;

	import { type Snippet as File } from 'svelte';

	type __rsvelte_props_type0 = { header?: File };
let { header }: __rsvelte_props_type0 = $props();

;

async () => {
  {
    svelteHTML.createElement("p", {});
    (header ? 'with header' : 'no header');
  }
};
const File__SvelteComponent_ = __rsvelte_export_component<__rsvelte_props_type0, {}, "">();
type File__SvelteComponent_ = ReturnType<typeof File__SvelteComponent_>;
export default File__SvelteComponent_;
