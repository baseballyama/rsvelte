import * as $ from 'svelte/internal/server';
import { Avatar } from "../../src/index";
import { users } from "../data/userlist";

export default function Avatar_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const singleUser = {
			id: 103,
			name: "Ned Stark",
			avatar: "https://cdn.svar.dev/demos/assets/avatar/491902305.jpg"
		};

		const singleInitials = { id: 1, name: "John Doe" };
		const singleColor = { id: 2, name: "Jane Smith", color: "#2ecc71" };

		const singleTwoWords = {
			id: 3,
			name: "Daenerys Stormborn Targaryen",
			color: "#e74c3c"
		};

		const singleNoName = { id: 4, color: "#9b59b6" };
		const stackUsers = users.slice(0, 5).map((u) => ({ id: u.id, name: u.label, avatar: u.avatar }));

		const stackMixed = [
			{ id: 1, name: "Alice", color: "#3498db" },
			{
				id: 2,
				name: "Bob",
				avatar: "https://cdn.svar.dev/demos/assets/avatar/503723673.jpg"
			},
			{ id: 3, name: "Charlie", color: "#e74c3c" }
		];

		const stackOverflowMixed = [
			// with pictures
			{
				id: users[0].id,
				name: users[0].label,
				avatar: users[0].avatar
			},

			{
				id: users[1].id,
				name: users[1].label,
				avatar: users[1].avatar
			},

			// without picture, dark background
			{ id: 1001, name: "Dark background", color: "#34495e" },

			// again with pictures
			{
				id: users[2].id,
				name: users[2].label,
				avatar: users[2].avatar
			},

			// without picture, light background
			{ id: 1002, name: "Light background", color: "#ecf4ff" },

			// and more with pictures
			{
				id: users[3].id,
				name: users[3].label,
				avatar: users[3].avatar
			},

			{
				id: users[4].id,
				name: users[4].label,
				avatar: users[4].avatar
			}
		];

		$$renderer.push(`<div class="demo-box"><h3>Single avatars</h3> <div class="single-avatars-row svelte-15yo1bu"><div class="single-avatar-item svelte-15yo1bu"><div class="single-avatar-slot svelte-15yo1bu">`);
		Avatar($$renderer, { value: singleUser, size: 32 });
		$$renderer.push(`<!----></div> <span class="svelte-15yo1bu">Image</span></div> <div class="single-avatar-item svelte-15yo1bu"><div class="single-avatar-slot svelte-15yo1bu">`);
		Avatar($$renderer, { value: singleInitials, size: 32 });
		$$renderer.push(`<!----></div> <span class="svelte-15yo1bu">Initials (default)</span></div> <div class="single-avatar-item svelte-15yo1bu"><div class="single-avatar-slot svelte-15yo1bu">`);
		Avatar($$renderer, { value: singleColor, size: 32 });
		$$renderer.push(`<!----></div> <span class="svelte-15yo1bu">Initials + color</span></div> <div class="single-avatar-item svelte-15yo1bu"><div class="single-avatar-slot svelte-15yo1bu">`);
		Avatar($$renderer, { value: singleTwoWords, size: 32 });
		$$renderer.push(`<!----></div> <span class="svelte-15yo1bu">2 letters</span></div> <div class="single-avatar-item svelte-15yo1bu"><div class="single-avatar-slot svelte-15yo1bu">`);
		Avatar($$renderer, { value: singleNoName, size: 32 });
		$$renderer.push(`<!----></div> <span class="svelte-15yo1bu">Color, no name</span></div></div></div> <div class="demo-box"><h3>Avatar sizes</h3> <div class="sizes svelte-15yo1bu">`);
		Avatar($$renderer, { value: singleUser, size: 16 });
		$$renderer.push(`<!----> `);
		Avatar($$renderer, { value: singleUser, size: 20 });
		$$renderer.push(`<!----> `);
		Avatar($$renderer, { value: singleUser, size: 24 });
		$$renderer.push(`<!----> `);
		Avatar($$renderer, { value: singleUser, size: 28 });
		$$renderer.push(`<!----> `);
		Avatar($$renderer, { value: singleUser, size: 32 });
		$$renderer.push(`<!----> `);
		Avatar($$renderer, { value: singleUser, size: 40 });
		$$renderer.push(`<!----> `);
		Avatar($$renderer, { value: singleUser, size: 48 });
		$$renderer.push(`<!----></div></div> <div class="demo-box"><h3>Avatar stack (multiple users)</h3> `);
		Avatar($$renderer, { value: stackUsers });
		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Avatar stack (mixed image and initials)</h3> `);
		Avatar($$renderer, { value: stackMixed });
		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Dynamic: +N when stack doesn't fit (resize to see)</h3> <p>Resize the container — +N appears when avatars overflow.</p> <div class="avatar-resizable svelte-15yo1bu">`);
		Avatar($$renderer, { value: stackOverflowMixed });
		$$renderer.push(`<!----></div></div> <div class="demo-box"><h3>With limit (optional cap)</h3> <p>limit=6 caps max visible; container can further reduce.</p> <div class="avatar-resizable svelte-15yo1bu">`);
		Avatar($$renderer, { value: stackOverflowMixed, limit: 6 });
		$$renderer.push(`<!----></div></div> <div class="demo-box"><h3>Avatar stack sizes</h3> <div class="sizes svelte-15yo1bu">`);
		Avatar($$renderer, { value: stackUsers.slice(0, 4), size: 24 });
		$$renderer.push(`<!----> `);
		Avatar($$renderer, { value: stackUsers.slice(0, 4), size: 32 });
		$$renderer.push(`<!----> `);
		Avatar($$renderer, { value: stackUsers.slice(0, 4), size: 40 });
		$$renderer.push(`<!----></div></div>`);
	});
}