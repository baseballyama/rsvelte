;
import Legacy from './legacy.svelte';;
import LegacyExport from './legacy-export.svelte';;
import TemplateAwait from './template-await.svelte';;
import Events from './events.svelte';;
import Slots from './slots.svelte';;
import OwnRecord from './own-record.svelte';;

;

function $$render() {
  
	
	
	
	
	
	
	let legacy: Legacy | undefined = $state();
	const types: number[] = [Legacy, LegacyExport, TemplateAwait, Events, Slots];

;

  async () => {
    {
      legacy = __rsvelte_bind_this(__rsvelte_component(Legacy))(__rsvelte_internals(), {
        "foo": "s",
      });
    }
    {
      __rsvelte_component(LegacyExport)(__rsvelte_internals(), {
        "foo": "s",
      });
    }
    {
      __rsvelte_component(TemplateAwait)(__rsvelte_internals(), {
        "foo": "s",
      });
    }
    {
      __rsvelte_component(Events)(__rsvelte_internals(), {
        "foo": "s",
      });
    }
    {
      __rsvelte_component(Slots)(__rsvelte_internals(), {
        "foo": "s",
      });
    }
    {
      __rsvelte_component(OwnRecord)(__rsvelte_internals(), {
        "foo": "s",
      });
    }
  };
  return __rsvelte_export_component<globalThis.Record<string, never>, {}, "">();
}
const Import__SvelteComponent_ = $$render();
type Import__SvelteComponent_ = ReturnType<typeof Import__SvelteComponent_>;
export default Import__SvelteComponent_;
