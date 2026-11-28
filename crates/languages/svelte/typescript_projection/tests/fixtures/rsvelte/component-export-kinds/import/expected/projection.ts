;
import Legacy from './legacy.svelte';;
import LegacyExport from './legacy-export.svelte';;
import TemplateAwait from './template-await.svelte';;
import Events from './events.svelte';;
import Slots from './slots.svelte';;
import OwnRecord from './own-record.svelte';;
import RunesSlotsInterface from './runes-slots-interface.svelte';;
import RunesSlotsRead from './runes-slots-read.svelte';;
import LegacySlotsInterface from './legacy-slots-interface.svelte';;
import EmptyEvents from './empty-events.svelte';;
import DispatchedEvents from './dispatched-events.svelte';;
import ForwardedEvents from './forwarded-events.svelte';;
import StoreNamedState from './store-named-state.svelte';;

;

function $$render() {
  
	
	
	
	
	
	
	
	
	
	
	
	
	
	let legacy: Legacy | undefined = $state();
	const types: number[] = [Legacy, LegacyExport, TemplateAwait, Events, Slots, RunesSlotsInterface, RunesSlotsRead, LegacySlotsInterface, EmptyEvents, DispatchedEvents, ForwardedEvents, StoreNamedState];

;

  async () => {
    {
      legacy = new (__rsvelte_bind_this(__rsvelte_component(Legacy)))(__rsvelte_internals(), {
        props: {
          "foo": "s",
        },
      });
    }
    {
      new (__rsvelte_component(LegacyExport))(__rsvelte_internals(), {
        props: {
          "foo": "s",
        },
      });
    }
    {
      new (__rsvelte_component(TemplateAwait))(__rsvelte_internals(), {
        props: {
          "foo": "s",
        },
      });
    }
    {
      new (__rsvelte_component(Events))(__rsvelte_internals(), {
        props: {
          "foo": "s",
        },
      });
    }
    {
      new (__rsvelte_component(Slots))(__rsvelte_internals(), {
        props: {
          "foo": "s",
        },
      });
    }
    {
      new (__rsvelte_component(OwnRecord))(__rsvelte_internals(), {
        props: {
          "foo": "s",
        },
      });
    }
    {
      new (__rsvelte_component(RunesSlotsInterface))(__rsvelte_internals(), {
        props: {
          "foo": "s",
        },
      });
    }
    {
      new (__rsvelte_component(RunesSlotsRead))(__rsvelte_internals(), {
        props: {
          "foo": "s",
        },
      });
    }
    {
      new (__rsvelte_component(LegacySlotsInterface))(__rsvelte_internals(), {
        props: {
          "foo": "s",
        },
      });
    }
    {
      new (__rsvelte_component(EmptyEvents))(__rsvelte_internals(), {
        props: {
          "foo": "s",
        },
      });
    }
    {
      new (__rsvelte_component(DispatchedEvents))(__rsvelte_internals(), {
        props: {
          "foo": "s",
        },
      });
    }
    {
      new (__rsvelte_component(ForwardedEvents))(__rsvelte_internals(), {
        props: {
          "foo": "s",
        },
      });
    }
    {
      new (__rsvelte_component(StoreNamedState))(__rsvelte_internals(), {
        props: {
          "foo": "s",
        },
      });
    }
  };
  return __rsvelte_export_component<globalThis.Record<string, never>, {}, "">();
}
const Import__SvelteComponent_ = $$render();
type Import__SvelteComponent_ = ReturnType<typeof Import__SvelteComponent_>;
export default Import__SvelteComponent_;
