;

	let open = $state(false);
	let kind = $state('info');

;

{
  svelteHTML.createElement("p", {
    class: kind,
  });
}
{
  svelteHTML.createElement("p", {
    class: `note ${kind}`,
  });
}
{
  svelteHTML.createElement("p", {});
  (open);
}
{
  svelteHTML.createElement("p", {
    class: "static",
  });
  (open);
}
{
  svelteHTML.createElement("p", {
    class: { open },
  });
}
{
  svelteHTML.createElement("p", {
    class: 'fixed & sure',
  });
}
{
  svelteHTML.createElement("span", {
    class: "plain",
  });
}
{
  svelteHTML.createElement("button", {
    onclick: () => (open = !open),
  });
}
export default __rsvelte_export_component<Record<string, never>, {}, "">();
