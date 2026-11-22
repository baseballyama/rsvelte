;
import StrayBrace from './stray-brace.svelte';;
import Legacy from './stray-brace-legacy.svelte';;
import JavaScript from './stray-brace-javascript.svelte';;
import Async from './stray-brace-async.svelte';;
import Slot from './stray-brace-slot.svelte';;

;

function $$render() {
  
	
	
	
	
	
	let legacy: Legacy | undefined;

;

  async () => {
    {
      __rsvelte_component(StrayBrace)(__rsvelte_internals(), {
        "n": "x",
      });
    }
    {
      __rsvelte_component(Legacy)(__rsvelte_internals(), {
        "n": "x",
      });
    }
    {
      __rsvelte_component(JavaScript)(__rsvelte_internals(), {
        "n": "x",
      });
    }
    {
      __rsvelte_component(Async)(__rsvelte_internals(), {
        "n": "x",
      });
    }
    {
      __rsvelte_component(Slot)(__rsvelte_internals(), {
        "n": "x",
      });
    }
    {
      legacy = __rsvelte_bind_this(__rsvelte_component(Legacy))(__rsvelte_internals(), {
        "n": 1,
      });
    }
  };
  return __rsvelte_export_isomorphic<globalThis.Record<string, never>, { [evt: string]: CustomEvent<any> }, {}, string>()({});
}
const StrayBraceImport__SvelteComponent_ = $$render();
type StrayBraceImport__SvelteComponent_ = InstanceType<typeof StrayBraceImport__SvelteComponent_>;
export default StrayBraceImport__SvelteComponent_;
