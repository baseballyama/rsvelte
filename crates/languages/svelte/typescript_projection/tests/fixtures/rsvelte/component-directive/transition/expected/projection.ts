;
import Comp from './Comp.svelte';;

;

function $$render() {
  
	
	function f(node: Element, p: { d: number }) { return {}; }
	function g(node: Element, m: any, p: { d: number }) { return {}; }

;

  async () => {
    {
      new (__rsvelte_component(Comp))(__rsvelte_internals(), {
        props: {
          children: __rsvelte_children,
        },
      });
      __sveltets_2_ensureType(String, Number, 1);
      Comp;
    }
    {
      new (__rsvelte_component(Comp))(__rsvelte_internals(), {
        props: {
          children: __rsvelte_children,
        },
      });
      __sveltets_2_ensureTransition(f(__rsvelte_any_node, ({ d: 's' })));
      Comp;
    }
    {
      new (__rsvelte_component(Comp))(__rsvelte_internals(), {
        props: {
          children: __rsvelte_children,
        },
      });
      __sveltets_2_ensureTransition(f(__rsvelte_any_node));
      Comp;
    }
    {
      new (__rsvelte_component(Comp))(__rsvelte_internals(), {
        props: {
          children: __rsvelte_children,
        },
      });
      __sveltets_2_ensureAnimation(g(__rsvelte_any_node, __sveltets_2_AnimationMove, ({ d: 's' })));
      Comp;
    }
  };
  return __rsvelte_export_isomorphic<globalThis.Record<string, never>, {}, string>()(__rsvelte_any_event({}), {});
}
const Transition__SvelteComponent_ = $$render();
type Transition__SvelteComponent_ = InstanceType<typeof Transition__SvelteComponent_>;
export default Transition__SvelteComponent_;
