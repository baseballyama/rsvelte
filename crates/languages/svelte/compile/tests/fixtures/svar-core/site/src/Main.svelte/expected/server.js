import * as $ from 'svelte/internal/server';
import SearchList from "./components/SearchList.svelte";
import Form from "./components/Form.svelte";
import CalendarUploader from "./components/CalendarUploader.svelte";
import RadioCheckboxes from "./components/RadioCheckboxes.svelte";
import Topbar from "./components/Topbar.svelte";

export default function Main($$renderer) {
	$$renderer.push(`<div class="demo svelte-l0ke6q"><div class="wrapper svelte-l0ke6q">`);
	Topbar($$renderer, {});
	$$renderer.push(`<!----> <div class="columns svelte-l0ke6q">`);
	CalendarUploader($$renderer, {});
	$$renderer.push(`<!----> `);
	SearchList($$renderer, {});
	$$renderer.push(`<!----> `);
	Form($$renderer, {});
	$$renderer.push(`<!----> `);
	RadioCheckboxes($$renderer, {});
	$$renderer.push(`<!----></div></div></div>`);
}