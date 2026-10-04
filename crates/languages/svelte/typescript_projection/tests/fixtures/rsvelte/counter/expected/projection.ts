;

	let count = $state(0);

;

{
  svelteHTML.createElement("button", {
    onclick: () => count++,
  });
  (count);
}
export default __rsvelte_export_component<Record<string, never>, {}, "">();
