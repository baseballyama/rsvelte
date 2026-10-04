;

	let size: number = $state(1);
	let name: string = $state('a');

;

{
  svelteHTML.createElement("select", {
    value: size,
    onchange: (e) => (size = e.currentTarget.selectedIndex),
  });
  {
    svelteHTML.createElement("option", {
      value: 1,
    });
  }
  {
    svelteHTML.createElement("option", {
      value: 2,
    });
  }
}
{
  svelteHTML.createElement("select", {
    value: name.toFixed(1),
  });
  {
    svelteHTML.createElement("option", {});
    (name);
  }
}
export default __rsvelte_export_component<Record<string, never>, {}, "">();
