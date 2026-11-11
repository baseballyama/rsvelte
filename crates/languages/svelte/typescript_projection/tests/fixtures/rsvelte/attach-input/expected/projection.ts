;

	let text = $state('');
	let focused = $state(false);

	function autofocus(node) {
		node.focus();
	}

;

() => {
  {
    svelteHTML.createElement("label", {});
    {
      svelteHTML.createElement("input", {
        "bind:value": text,
        [Symbol("@attach")]: autofocus,
      });
      () => {
        // @ts-ignore
        text = __rsvelte_untyped_prop();
      };
    }
  }
  {
    svelteHTML.createElement("p", {
      [Symbol("@attach")]: () => {
	focused = text.length > 0;
},
    });
    (focused ? 'typing' : 'idle');
  }
};
export default __rsvelte_export_component<__rsvelte_no_props, {}, "">();
