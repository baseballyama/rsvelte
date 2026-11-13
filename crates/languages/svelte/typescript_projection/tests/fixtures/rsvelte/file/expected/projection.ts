;

	import { type Snippet as File } from 'svelte';

	type $$ComponentProps = { header?: File };
let { header }: $$ComponentProps = $props();

;

async () => {
  {
    svelteHTML.createElement("p", {});
    header ? 'with header' : 'no header';
  }
};
const File__SvelteComponent_ = __rsvelte_export_component<$$ComponentProps, {}, "">();
type File__SvelteComponent_ = ReturnType<typeof File__SvelteComponent_>;
export default File__SvelteComponent_;
