;
type $$ComponentProps = { items: string[] };

;

function $$render() {
  
	let { items }: $$ComponentProps = $props();
	const rest = { extra: 1 };

;

  async () => {
    {
      __rsvelte_slots()("default", {
        "first": items[0],
        "label": "text",
        "mixed": `a ${items.length}`,
      });
    }
    {
      for (let [, item] of __rsvelte_each(items)) {
        {
          __rsvelte_slots()("row", {
            item,
            ...(rest),
          });
        }
      }
    }
    {
      __rsvelte_slots()("footer", {
        "class": 1,
      });
    }
  };
  return __rsvelte_export_isomorphic_slots<$$ComponentProps, {}, "">()(__rsvelte_any_event({}), {
    "default": {
      first: items[0],
      label: "",
      mixed: "",
    },
    "row": {
      item: __rsvelte_untyped_prop(),
      ...(rest),
    },
    "footer": {
      class: 1,
    },
  });
}
const SlotDefFromSlots__SvelteComponent_ = $$render();
type SlotDefFromSlots__SvelteComponent_ = InstanceType<typeof SlotDefFromSlots__SvelteComponent_>;
export default SlotDefFromSlots__SvelteComponent_;
