;
import type { Readable } from 'svelte/store';;

;

function $$render() {
  
	

	let count = 1;;let $count = __sveltets_2_store_get(count);

	let later: Readable<number>;;let $later = __sveltets_2_store_get(later);

	const doubled = $count * 2;

;

  async () => {
    {
      svelteHTML.createElement("p", {});
      ($count);
      (doubled);
      ($later);
    }
  };
  return __rsvelte_export_component<__rsvelte_no_props, {}, "">();
}
const StoreThatIsNotAStore__SvelteComponent_ = $$render();
type StoreThatIsNotAStore__SvelteComponent_ = ReturnType<typeof StoreThatIsNotAStore__SvelteComponent_>;
export default StoreThatIsNotAStore__SvelteComponent_;
