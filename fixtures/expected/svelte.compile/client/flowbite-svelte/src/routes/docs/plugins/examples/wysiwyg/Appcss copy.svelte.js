import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Clipboard } from "$lib";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> Copied`, 1);
var root_1 = $.from_html(`<!> Copy code`, 1);
var root_2 = $.from_html(`<div class="relative rounded-lg bg-gray-50 p-4 dark:bg-gray-700"><pre><code id="css-block"></code></pre> <!></div>`);

export default function Appcss_copy($$anchor) {
	let value = $.state("");
	let success = $.state(false);

	function onclick(ev) {
		const target = ev.target;
		const codeBlock = target.ownerDocument.querySelector("#css-block");

		if (codeBlock) {
			$.set(value, codeBlock.textContent || "", true);
		}
	}

	const cssCode = `/* texteditor */
  :root {
    --white: #fff;
    --black: #2e2b29;
    --black-contrast: #110f0e;
    --gray-1: rgba(61, 37, 20, 0.05);
    --gray-2: rgba(61, 37, 20, 0.08);
    --gray-3: rgba(61, 37, 20, 0.12);
    --gray-4: rgba(53, 38, 28, 0.3);
    --gray-5: rgba(28, 25, 23, 0.6);
    --green: #22c55e;
    --purple: #6a00f5;
    --purple-contrast: #5800cc;
    --purple-light: rgba(88, 5, 255, 0.05);
    --yellow-contrast: #facc15;
    --yellow: rgba(250, 204, 21, 0.4);
    --yellow-light: #fffae5;
    --red: #ff5c33;
    --red-light: #ffebe5;
    --shadow: 0px 12px 33px 0px rgba(0, 0, 0, 0.06), 0px 3.618px 9.949px 0px rgba(0, 0, 0, 0.04);
  }

  .tiptap:first-child {
    margin-top: 0;
  }

  /* blockquote */
  .tiptap blockquote {
    border-left: 3px solid var(--gray-3);
    margin: 1.5rem 0;
    padding-left: 1rem;
  }

  /* bubble menu */
  .bubble-menu {
    background-color: var(--white);
    border: 1px solid var(--gray-1);
    border-radius: 0.7rem;
    box-shadow: var(--shadow);
    display: flex;
    padding: 0.2rem;
  }

  .bubble-menu button {
    background-color: unset;
    border-radius: 0.5rem;
    border: none;
    color: var(--black);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.15;
    padding: 0.375rem 0.625rem;
    transition: all 0.2s cubic-bezier(0.65, 0.05, 0.36, 1);
  }

  .bubble-menu button:hover {
    background-color: var(--gray-3);
  }

  .bubble-menu button.is-active {
    background-color: var(--purple);
    color: var(--white);
  }

  .bubble-menu button.is-active:hover {
    background-color: var(--purple-contrast);
  }

  /* character count */
  .character-count {
    align-items: center;
    color: var(--gray-5);
    display: flex;
    font-size: 0.75rem;
    gap: 0.5rem;
    margin: 1.5rem;
  }

  .dark .character-count {
    color: #777;
  }

  .character-count svg {
    color: var(--purple);
  }

  .character-count--warning,
  .character-count--warning svg {
    color: var(--red);
  }

  /* floating menu */
  .floating-menu {
    display: flex;
    background-color: var(--gray-3);
    padding: 0.1rem;
    border-radius: 0.5rem;
    gap: 0.1rem;
  }

  .floating-menu button {
    background-color: unset;
    padding: 0.275rem 0.425rem;
    border-radius: 0.3rem;
    flex-shrink: 0;
  }

  .floating-menu button:hover {
    background-color: var(--gray-3);
  }

  .floating-menu button.is-active {
    background-color: var(--white);
    color: var(--purple);
  }

  .floating-menu button.is-active:hover {
    color: var(--purple-contrast);
  }

  /* Invisible characters */
  .Tiptap-invisible-character {
    height: 0;
    padding: 0;
    pointer-events: none;
    user-select: none;
    width: 0;
  }

  .Tiptap-invisible-character::before {
    caret-color: inherit;
    color: #aaa;
    display: inline-block;
    font-style: normal;
    font-weight: 400;
    line-height: 1em;
    width: 0;
  }

  .Tiptap-invisible-character--space::before {
    content: '·';
  }

  .Tiptap-invisible-character--break::before {
    content: '¬';
  }

  .Tiptap-invisible-character--paragraph::before {
    content: '¶';
  }

  .Tiptap-invisible-character + img.ProseMirror-separator {
    height: 0 !important;
    pointer-events: none;
    user-select: none;
    width: 0 !important;
  }

  .is-empty[data-placeholder].has-focus > .Tiptap-invisible-character {
    display: none;
  }

  /* Details */
  .tiptap .details {
    display: flex;
    gap: 0.25rem;
    margin: 1.5rem 0;
    border: 1px solid var(--gray-3);
    border-radius: 0.5rem;
    padding: 0.5rem;
  }

  .tiptap .details summary {
    font-weight: 700;
    list-style: none;
    margin: 0;
  }

  .tiptap .details > button {
    align-items: center;
    background: transparent;
    border-radius: 4px;
    display: flex;
    font-size: 0.625rem;
    height: 1.25rem;
    justify-content: center;
    line-height: 1;
    margin-top: 6px !important;
    padding: 0;
    width: 1.25rem;
  }

  .tiptap .details > button:hover {
    background-color: var(--gray-3);
  }

  .tiptap .details > button::before {
    content: '▶';
    display: inline-block;
    position: relative;
  }

  .tiptap .details.is-open > button::before {
    transform: rotate(90deg);
  }

  .tiptap .details > div {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    margin: 0;
  }

  .tiptap .details > div > [data-type='detailsContent'] > :last-child {
    margin-top: 0.5rem !important;
    margin-bottom: 0.5rem !important;
  }

  .tiptap .details > div > [data-type='detailsContent'] {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }

  .tiptap .details .details {
    margin: 0.5rem 0;
  }

  /* drag handle */
  [id^='drag-handle-'] ::selection {
    background-color: #70cff850;
  }

  .dark [id^='drag-handle-'] .ProseMirror-hideselection *::selection {
    background-color: #e3508950 !important;
  }

  [id^='drag-handle-'] .ProseMirror {
    padding: 1rem 1rem 1rem 0;
    position: relative;
  }

  [id^='drag-handle-'] .ProseMirror * {
    margin-top: 0.75em;
  }

  [id^='drag-handle-'] .ProseMirror > * {
    margin-left: 3rem;
  }

  [id^='drag-handle-'] .ProseMirror .ProseMirror-widget * {
    margin-top: auto;
  }

  [id^='drag-handle-'] .ProseMirror ul,
  [id^='drag-handle-'] .ProseMirror ol {
    padding: 0 1rem;
  }

  [id^='drag-handle-'] .ProseMirror-noderangeselection *::selection {
    background: transparent;
  }

  [id^='drag-handle-'] .ProseMirror-hideselection *::selection {
    background-color: #70cff850 !important;
  }

  [id^='drag-handle-'] .ProseMirror-noderangeselection * {
    caret-color: transparent;
  }

  [id^='drag-handle-'] .ProseMirror-selectednode,
  [id^='drag-handle-'] .ProseMirror-selectednoderange {
    position: relative;
  }

  [id^='drag-handle-'] .ProseMirror-selectednode::before,
  [id^='drag-handle-'] .ProseMirror-selectednoderange::before {
    position: absolute;
    pointer-events: none;
    z-index: -1;
    content: '';
    top: -0.25rem;
    left: -0.25rem;
    right: -0.25rem;
    bottom: -0.25rem;
    background-color: #70cff850;
    border-radius: 0.2rem;
  }

  [id^='drag-handle-'] .drag-handle {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 1rem;
    height: 1.25rem;
    content: '⠿';
    margin-top: 0.3rem;
    /* top: 1rem !important; */
    font-weight: 700;
    cursor: grab;
    background: #0d0d0d10;
    color: #0d0d0d;
    border-radius: 0.25rem;
    /* opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important; */
  }

  .dark [id^='drag-handle-'] .drag-handle {
    background: #ffffff;
    color: #179df186;
  }

  [id^='drag-handle-'] .drag-handle:hover {
    transform: scale(1.1) !important;
  }

  /* emoji */
  [data-type='emoji'] {
    img {
      height: 1em;
      width: 1em;
      display: inline;
      margin: 0 !important;
      padding: 0 !important;
    }
  }

  /* mention */
  [data-type='mention'] {
    background-color: rgba(88, 5, 255, 0.05);
    border-radius: 0.4rem;
    box-decoration-break: clone;
    color: #6a00f5;
    padding: 0.1rem 0.3rem;
  }

  /*  mention and emoji */
  .emoji-suggestion-popup .dropdown-menu button,
  .mention-suggestion-popup .mention-dropdown button {
    align-items: center;
    background-color: transparent;
    display: flex;
    gap: 0.25rem;
    text-align: left;
    width: 100%;
  }

  .emoji-suggestion-popup .dropdown-menu button:hover,
  .emoji-suggestion-popup .dropdown-menu button:hover.is-selected,
  .mention-suggestion-popup .mention-dropdown button:hover,
  .mention-dropdown button:hover.is-selected {
    background-color: rgba(61, 37, 20, 0.12);
  }

  .emoji-suggestion-popup .dropdown-menu button.is-selected,
  .mention-suggestion-popup .mention-dropdown button.is-selected {
    background-color: rgba(61, 37, 20, 0.08);
  }

  .emoji-suggestion-popup .dropdown-menu button img,
  .mention-suggestion-popup .dropdown-menu button img {
    height: 1em;
    width: 1em;
  }

  .emoji-suggestion-popup,
  .mention-suggestion-popup {
    transform-origin: center !important;
  }

  .emoji-suggestion-popup .dropdown-menu,
  .mention-suggestion-popup .mention-dropdown {
    background: #fff;
    border: 1px solid rgba(61, 37, 20, 0.05);
    border-radius: 0.7rem;
    box-shadow:
      0px 12px 33px 0px rgba(0, 0, 0, 0.06),
      0px 3.618px 9.949px 0px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    overflow: auto;
    padding: 0.6rem;
    position: relative;
    min-width: 200px;
    max-width: 300px;
    width: max-content;
  }

  /* highlight */
  .tiptap mark {
    background-color: #faf594;
    border-radius: 0.4rem;
    box-decoration-break: clone;
    padding: 0.1rem 0.3rem;
  }

  /* hr: horizontal rule */
  .tiptap hr {
    border: none;
    border-top: 1px solid var(--gray-2);
    cursor: pointer;
    margin: 2rem 0;
  }

  .tiptap hr.ProseMirror-selectednode {
    border-top: 1px solid var(--purple) !important;
  }

  /* placeholder */
  p.is-editor-empty:first-child::before {
    color: var(--gray-4);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  .dark p.is-editor-empty:first-child::before {
    color: #666;
  }

  summary.is-empty::before {
    color: var(--gray-4);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  .dark summary.is-empty::before {
    color: #666;
  }

  [data-type='detailsContent'].is-empty::before {
    color: var(--gray-4);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
    position: relative;
    top: 0.5rem;
  }

  .dark [data-type='detailsContent'].is-empty::before {
    color: #666;
  }

  [id^='drag-handle-'] [data-type='detailsContent'].is-empty::before {
    top: 0.5rem;
  }

  /* Table-specific styling */
  .tiptap table {
    border-collapse: collapse;
    margin: 0;
    overflow: hidden;
    table-layout: fixed;
    width: 100%;
  }

  .tiptap table td,
  .tiptap table th {
    border: 1px solid var(--gray-3);
    box-sizing: border-box;
    min-width: 1em;
    padding: 6px 8px;
    position: relative;
    vertical-align: top;
  }

  .tiptap table td > *,
  .tiptap table th > * {
    margin-bottom: 0;
  }

  .tiptap table th {
    background-color: var(--gray-1);
    font-weight: bold;
    text-align: left;
  }

  .tiptap table .selectedCell:after {
    background: var(--gray-2);
    content: '';
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
    position: absolute;
    z-index: 2;
  }

  .tiptap table .column-resize-handle {
    background-color: var(--purple);
    bottom: -2px;
    pointer-events: none;
    position: absolute;
    right: -2px;
    top: 0;
    width: 4px;
  }

  .tiptap .tableWrapper {
    margin: 1.5rem 0;
    overflow-x: auto;
  }

  .tiptap.resize-cursor {
    cursor: col-resize;
  }

  /* List styles */
  .tiptap ul,
  .tiptap ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;
  }

  .tiptap ul li p,
  .tiptap ol li p {
    margin-bottom: 0.15em;
  }

  /* Mathematics extension styles */
  .tiptap .tiptap-mathematics-render {
    padding: 0 0.25rem;
  }

  .tiptap .tiptap-mathematics-render--editable {
    cursor: pointer;
    transition: background 0.2s;
  }

  .tiptap .tiptap-mathematics-render--editable:hover {
    background: #eee;
  }

  .tiptap .tiptap-mathematics-render {
    border-radius: 0.25rem;
  }

  .tiptap .tiptap-mathematics-render[data-type='inline-math'] {
    display: inline-block;
  }

  .tiptap .tiptap-mathematics-render[data-type='block-math'] {
    display: block;
    margin: 1rem 0;
    padding: 1rem;
    text-align: center;
  }

  .tiptap .tiptap-mathematics-render.inline-math-error,
  .tiptap .tiptap-mathematics-render.block-math-error {
    background: var(--red-light);
    color: var(--red);
    border: 1px solid var(--red-dark);
    padding: 0.5rem;
    border-radius: 0.25rem;
  }

  /* Task list specific styles */
  .tiptap ul[data-type='taskList'] {
    list-style: none;
    margin-left: 0;
    padding: 0.2em;
  }

  .tiptap ul[data-type='taskList'] li {
    align-items: flex-start;
    display: flex;
    margin: 0 !important;
    padding: 0.3em !important;
    gap: 0.5rem;
  }

  .tiptap ul[data-type='taskList'] li > label {
    flex: 0 0 auto;
    user-select: none;
    margin-top: -0.1em !important;
  }

  .tiptap ul[data-type='taskList'] li > div {
    flex: 1 1 auto;
    margin: 0 !important;
    padding: 0 !important;
    /* Prevent content from overflowing */
    min-width: 0;
  }

  .tiptap ul[data-type='taskList'] input[type='checkbox'] {
    cursor: pointer;
    /* Ensure consistent checkbox sizing */
    margin: 0;
    flex-shrink: 0;
  }

  .tiptap ul[data-type='taskList'] ul[data-type='taskList'] {
    margin: 0 !important;
  }

  /* Optional: Handle the span element in your label if it's for custom styling */
  .tiptap ul[data-type='taskList'] li > label span {
    display: inline-block;
    /* Add custom checkbox styles here if needed */
  }

  /* Ensure paragraphs in task list items don't add extra spacing */
  .tiptap ul[data-type='taskList'] li p {
    margin: 0 !important;
  }

  /* toc  #toc-ex*/
  #toc-ex .col-group {
    display: flex;
    flex-direction: row;
  }

  @media (max-width: 540px) {
    #toc-ex .col-group {
      flex-direction: column-reverse;
    }
  }

  #toc-ex .main {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: auto;
    /* max-height: 28rem; */
  }

  #toc-ex .sidebar {
    border-left: 1px solid var(--gray-3);
    flex-grow: 0;
    flex-shrink: 0;
    padding: 1rem;
    width: 15rem;
    position: sticky;
    height: 100vh;
    top: 0;
  }

  @media (min-width: 800px) {
    #toc-ex .sidebar {
      width: 20rem;
    }
  }

  @media (max-width: 540px) {
    #toc-ex .sidebar {
      border-bottom: 1px solid var(--gray-3);
      border-left: unset;
      width: 100%;
      height: auto;
      position: unset;
      padding: 1.5rem;
    }
  }

  #toc-ex .sidebar-options {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 1rem;
    position: sticky;
    top: 1rem;
  }

  #toc-ex .table-of-contents {
    display: flex;
    flex-direction: column;
    font-size: 0.875rem;
    gap: 0.25rem;
    overflow: auto;
    text-decoration: none;
  }

  #toc-ex .table-of-contents > div {
    border-radius: 0.25rem;
    padding-left: calc(0.875rem * (var(--level) - 1));
    transition: all 0.2s cubic-bezier(0.65, 0.05, 0.36, 1);
  }

  #toc-ex .table-of-contents > div:hover {
    background-color: var(--gray-2);
  }

  #toc-ex .table-of-contents .empty-state {
    color: var(--gray-5);
    user-select: none;
  }

  #toc-ex .table-of-contents .is-active a {
    color: var(--purple);
  }

  #toc-ex .table-of-contents .is-scrolled-over a {
    color: var(--gray-5);
  }

  .dark #toc-ex .table-of-contents a,
  .dark #toc-ex .table-of-contents .is-scrolled-over a {
    color: #888;
  }

  #toc-ex .table-of-contents a {
    color: var(--black);
    display: flex;
    gap: 0.25rem;
    text-decoration: none;
  }

  #toc-ex .table-of-contents a::before {
    content: attr(data-item-index) '.';
  }

  /* Youtube embed */
  .tiptap div[data-youtube-video] {
    cursor: move;
    padding-right: 1.5rem;
  }

  .tiptap div[data-youtube-video] iframe {
    border: 0.5rem solid var(--black-contrast);
    display: block;
    min-height: 200px;
    min-width: 200px;
    outline: 0px solid transparent;
  }

  .tiptap div[data-youtube-video].ProseMirror-selectednode iframe {
    outline: 3px solid var(--purple);
    transition: outline 0.15s;
  }

  /* confit test */
  .my-custom-class {
    border: 2px solid rgb(150, 238, 206);
  }`;

	var div = root_2();
	var pre = $.child(div);
	var code = $.child(pre);

	code.textContent = '/* texteditor */\n  :root {\n    --white: #fff;\n    --black: #2e2b29;\n    --black-contrast: #110f0e;\n    --gray-1: rgba(61, 37, 20, 0.05);\n    --gray-2: rgba(61, 37, 20, 0.08);\n    --gray-3: rgba(61, 37, 20, 0.12);\n    --gray-4: rgba(53, 38, 28, 0.3);\n    --gray-5: rgba(28, 25, 23, 0.6);\n    --green: #22c55e;\n    --purple: #6a00f5;\n    --purple-contrast: #5800cc;\n    --purple-light: rgba(88, 5, 255, 0.05);\n    --yellow-contrast: #facc15;\n    --yellow: rgba(250, 204, 21, 0.4);\n    --yellow-light: #fffae5;\n    --red: #ff5c33;\n    --red-light: #ffebe5;\n    --shadow: 0px 12px 33px 0px rgba(0, 0, 0, 0.06), 0px 3.618px 9.949px 0px rgba(0, 0, 0, 0.04);\n  }\n\n  .tiptap:first-child {\n    margin-top: 0;\n  }\n\n  /* blockquote */\n  .tiptap blockquote {\n    border-left: 3px solid var(--gray-3);\n    margin: 1.5rem 0;\n    padding-left: 1rem;\n  }\n\n  /* bubble menu */\n  .bubble-menu {\n    background-color: var(--white);\n    border: 1px solid var(--gray-1);\n    border-radius: 0.7rem;\n    box-shadow: var(--shadow);\n    display: flex;\n    padding: 0.2rem;\n  }\n\n  .bubble-menu button {\n    background-color: unset;\n    border-radius: 0.5rem;\n    border: none;\n    color: var(--black);\n    font-family: inherit;\n    font-size: 0.875rem;\n    font-weight: 500;\n    line-height: 1.15;\n    padding: 0.375rem 0.625rem;\n    transition: all 0.2s cubic-bezier(0.65, 0.05, 0.36, 1);\n  }\n\n  .bubble-menu button:hover {\n    background-color: var(--gray-3);\n  }\n\n  .bubble-menu button.is-active {\n    background-color: var(--purple);\n    color: var(--white);\n  }\n\n  .bubble-menu button.is-active:hover {\n    background-color: var(--purple-contrast);\n  }\n\n  /* character count */\n  .character-count {\n    align-items: center;\n    color: var(--gray-5);\n    display: flex;\n    font-size: 0.75rem;\n    gap: 0.5rem;\n    margin: 1.5rem;\n  }\n\n  .dark .character-count {\n    color: #777;\n  }\n\n  .character-count svg {\n    color: var(--purple);\n  }\n\n  .character-count--warning,\n  .character-count--warning svg {\n    color: var(--red);\n  }\n\n  /* floating menu */\n  .floating-menu {\n    display: flex;\n    background-color: var(--gray-3);\n    padding: 0.1rem;\n    border-radius: 0.5rem;\n    gap: 0.1rem;\n  }\n\n  .floating-menu button {\n    background-color: unset;\n    padding: 0.275rem 0.425rem;\n    border-radius: 0.3rem;\n    flex-shrink: 0;\n  }\n\n  .floating-menu button:hover {\n    background-color: var(--gray-3);\n  }\n\n  .floating-menu button.is-active {\n    background-color: var(--white);\n    color: var(--purple);\n  }\n\n  .floating-menu button.is-active:hover {\n    color: var(--purple-contrast);\n  }\n\n  /* Invisible characters */\n  .Tiptap-invisible-character {\n    height: 0;\n    padding: 0;\n    pointer-events: none;\n    user-select: none;\n    width: 0;\n  }\n\n  .Tiptap-invisible-character::before {\n    caret-color: inherit;\n    color: #aaa;\n    display: inline-block;\n    font-style: normal;\n    font-weight: 400;\n    line-height: 1em;\n    width: 0;\n  }\n\n  .Tiptap-invisible-character--space::before {\n    content: \'·\';\n  }\n\n  .Tiptap-invisible-character--break::before {\n    content: \'¬\';\n  }\n\n  .Tiptap-invisible-character--paragraph::before {\n    content: \'¶\';\n  }\n\n  .Tiptap-invisible-character + img.ProseMirror-separator {\n    height: 0 !important;\n    pointer-events: none;\n    user-select: none;\n    width: 0 !important;\n  }\n\n  .is-empty[data-placeholder].has-focus > .Tiptap-invisible-character {\n    display: none;\n  }\n\n  /* Details */\n  .tiptap .details {\n    display: flex;\n    gap: 0.25rem;\n    margin: 1.5rem 0;\n    border: 1px solid var(--gray-3);\n    border-radius: 0.5rem;\n    padding: 0.5rem;\n  }\n\n  .tiptap .details summary {\n    font-weight: 700;\n    list-style: none;\n    margin: 0;\n  }\n\n  .tiptap .details > button {\n    align-items: center;\n    background: transparent;\n    border-radius: 4px;\n    display: flex;\n    font-size: 0.625rem;\n    height: 1.25rem;\n    justify-content: center;\n    line-height: 1;\n    margin-top: 6px !important;\n    padding: 0;\n    width: 1.25rem;\n  }\n\n  .tiptap .details > button:hover {\n    background-color: var(--gray-3);\n  }\n\n  .tiptap .details > button::before {\n    content: \'▶\';\n    display: inline-block;\n    position: relative;\n  }\n\n  .tiptap .details.is-open > button::before {\n    transform: rotate(90deg);\n  }\n\n  .tiptap .details > div {\n    display: flex;\n    flex-direction: column;\n    gap: 1rem;\n    width: 100%;\n    margin: 0;\n  }\n\n  .tiptap .details > div > [data-type=\'detailsContent\'] > :last-child {\n    margin-top: 0.5rem !important;\n    margin-bottom: 0.5rem !important;\n  }\n\n  .tiptap .details > div > [data-type=\'detailsContent\'] {\n    margin-top: 0 !important;\n    margin-bottom: 0 !important;\n  }\n\n  .tiptap .details .details {\n    margin: 0.5rem 0;\n  }\n\n  /* drag handle */\n  [id^=\'drag-handle-\'] ::selection {\n    background-color: #70cff850;\n  }\n\n  .dark [id^=\'drag-handle-\'] .ProseMirror-hideselection *::selection {\n    background-color: #e3508950 !important;\n  }\n\n  [id^=\'drag-handle-\'] .ProseMirror {\n    padding: 1rem 1rem 1rem 0;\n    position: relative;\n  }\n\n  [id^=\'drag-handle-\'] .ProseMirror * {\n    margin-top: 0.75em;\n  }\n\n  [id^=\'drag-handle-\'] .ProseMirror > * {\n    margin-left: 3rem;\n  }\n\n  [id^=\'drag-handle-\'] .ProseMirror .ProseMirror-widget * {\n    margin-top: auto;\n  }\n\n  [id^=\'drag-handle-\'] .ProseMirror ul,\n  [id^=\'drag-handle-\'] .ProseMirror ol {\n    padding: 0 1rem;\n  }\n\n  [id^=\'drag-handle-\'] .ProseMirror-noderangeselection *::selection {\n    background: transparent;\n  }\n\n  [id^=\'drag-handle-\'] .ProseMirror-hideselection *::selection {\n    background-color: #70cff850 !important;\n  }\n\n  [id^=\'drag-handle-\'] .ProseMirror-noderangeselection * {\n    caret-color: transparent;\n  }\n\n  [id^=\'drag-handle-\'] .ProseMirror-selectednode,\n  [id^=\'drag-handle-\'] .ProseMirror-selectednoderange {\n    position: relative;\n  }\n\n  [id^=\'drag-handle-\'] .ProseMirror-selectednode::before,\n  [id^=\'drag-handle-\'] .ProseMirror-selectednoderange::before {\n    position: absolute;\n    pointer-events: none;\n    z-index: -1;\n    content: \'\';\n    top: -0.25rem;\n    left: -0.25rem;\n    right: -0.25rem;\n    bottom: -0.25rem;\n    background-color: #70cff850;\n    border-radius: 0.2rem;\n  }\n\n  [id^=\'drag-handle-\'] .drag-handle {\n    display: flex !important;\n    align-items: center !important;\n    justify-content: center !important;\n    width: 1rem;\n    height: 1.25rem;\n    content: \'⠿\';\n    margin-top: 0.3rem;\n    /* top: 1rem !important; */\n    font-weight: 700;\n    cursor: grab;\n    background: #0d0d0d10;\n    color: #0d0d0d;\n    border-radius: 0.25rem;\n    /* opacity: 1 !important;\n    visibility: visible !important;\n    pointer-events: auto !important; */\n  }\n\n  .dark [id^=\'drag-handle-\'] .drag-handle {\n    background: #ffffff;\n    color: #179df186;\n  }\n\n  [id^=\'drag-handle-\'] .drag-handle:hover {\n    transform: scale(1.1) !important;\n  }\n\n  /* emoji */\n  [data-type=\'emoji\'] {\n    img {\n      height: 1em;\n      width: 1em;\n      display: inline;\n      margin: 0 !important;\n      padding: 0 !important;\n    }\n  }\n\n  /* mention */\n  [data-type=\'mention\'] {\n    background-color: rgba(88, 5, 255, 0.05);\n    border-radius: 0.4rem;\n    box-decoration-break: clone;\n    color: #6a00f5;\n    padding: 0.1rem 0.3rem;\n  }\n\n  /*  mention and emoji */\n  .emoji-suggestion-popup .dropdown-menu button,\n  .mention-suggestion-popup .mention-dropdown button {\n    align-items: center;\n    background-color: transparent;\n    display: flex;\n    gap: 0.25rem;\n    text-align: left;\n    width: 100%;\n  }\n\n  .emoji-suggestion-popup .dropdown-menu button:hover,\n  .emoji-suggestion-popup .dropdown-menu button:hover.is-selected,\n  .mention-suggestion-popup .mention-dropdown button:hover,\n  .mention-dropdown button:hover.is-selected {\n    background-color: rgba(61, 37, 20, 0.12);\n  }\n\n  .emoji-suggestion-popup .dropdown-menu button.is-selected,\n  .mention-suggestion-popup .mention-dropdown button.is-selected {\n    background-color: rgba(61, 37, 20, 0.08);\n  }\n\n  .emoji-suggestion-popup .dropdown-menu button img,\n  .mention-suggestion-popup .dropdown-menu button img {\n    height: 1em;\n    width: 1em;\n  }\n\n  .emoji-suggestion-popup,\n  .mention-suggestion-popup {\n    transform-origin: center !important;\n  }\n\n  .emoji-suggestion-popup .dropdown-menu,\n  .mention-suggestion-popup .mention-dropdown {\n    background: #fff;\n    border: 1px solid rgba(61, 37, 20, 0.05);\n    border-radius: 0.7rem;\n    box-shadow:\n      0px 12px 33px 0px rgba(0, 0, 0, 0.06),\n      0px 3.618px 9.949px 0px rgba(0, 0, 0, 0.04);\n    display: flex;\n    flex-direction: column;\n    gap: 0.1rem;\n    overflow: auto;\n    padding: 0.6rem;\n    position: relative;\n    min-width: 200px;\n    max-width: 300px;\n    width: max-content;\n  }\n\n  /* highlight */\n  .tiptap mark {\n    background-color: #faf594;\n    border-radius: 0.4rem;\n    box-decoration-break: clone;\n    padding: 0.1rem 0.3rem;\n  }\n\n  /* hr: horizontal rule */\n  .tiptap hr {\n    border: none;\n    border-top: 1px solid var(--gray-2);\n    cursor: pointer;\n    margin: 2rem 0;\n  }\n\n  .tiptap hr.ProseMirror-selectednode {\n    border-top: 1px solid var(--purple) !important;\n  }\n\n  /* placeholder */\n  p.is-editor-empty:first-child::before {\n    color: var(--gray-4);\n    content: attr(data-placeholder);\n    float: left;\n    height: 0;\n    pointer-events: none;\n  }\n\n  .dark p.is-editor-empty:first-child::before {\n    color: #666;\n  }\n\n  summary.is-empty::before {\n    color: var(--gray-4);\n    content: attr(data-placeholder);\n    float: left;\n    height: 0;\n    pointer-events: none;\n  }\n\n  .dark summary.is-empty::before {\n    color: #666;\n  }\n\n  [data-type=\'detailsContent\'].is-empty::before {\n    color: var(--gray-4);\n    content: attr(data-placeholder);\n    float: left;\n    height: 0;\n    pointer-events: none;\n    position: relative;\n    top: 0.5rem;\n  }\n\n  .dark [data-type=\'detailsContent\'].is-empty::before {\n    color: #666;\n  }\n\n  [id^=\'drag-handle-\'] [data-type=\'detailsContent\'].is-empty::before {\n    top: 0.5rem;\n  }\n\n  /* Table-specific styling */\n  .tiptap table {\n    border-collapse: collapse;\n    margin: 0;\n    overflow: hidden;\n    table-layout: fixed;\n    width: 100%;\n  }\n\n  .tiptap table td,\n  .tiptap table th {\n    border: 1px solid var(--gray-3);\n    box-sizing: border-box;\n    min-width: 1em;\n    padding: 6px 8px;\n    position: relative;\n    vertical-align: top;\n  }\n\n  .tiptap table td > *,\n  .tiptap table th > * {\n    margin-bottom: 0;\n  }\n\n  .tiptap table th {\n    background-color: var(--gray-1);\n    font-weight: bold;\n    text-align: left;\n  }\n\n  .tiptap table .selectedCell:after {\n    background: var(--gray-2);\n    content: \'\';\n    left: 0;\n    right: 0;\n    top: 0;\n    bottom: 0;\n    pointer-events: none;\n    position: absolute;\n    z-index: 2;\n  }\n\n  .tiptap table .column-resize-handle {\n    background-color: var(--purple);\n    bottom: -2px;\n    pointer-events: none;\n    position: absolute;\n    right: -2px;\n    top: 0;\n    width: 4px;\n  }\n\n  .tiptap .tableWrapper {\n    margin: 1.5rem 0;\n    overflow-x: auto;\n  }\n\n  .tiptap.resize-cursor {\n    cursor: col-resize;\n  }\n\n  /* List styles */\n  .tiptap ul,\n  .tiptap ol {\n    padding: 0 1rem;\n    margin: 1.25rem 1rem 1.25rem 0.4rem;\n  }\n\n  .tiptap ul li p,\n  .tiptap ol li p {\n    margin-bottom: 0.15em;\n  }\n\n  /* Mathematics extension styles */\n  .tiptap .tiptap-mathematics-render {\n    padding: 0 0.25rem;\n  }\n\n  .tiptap .tiptap-mathematics-render--editable {\n    cursor: pointer;\n    transition: background 0.2s;\n  }\n\n  .tiptap .tiptap-mathematics-render--editable:hover {\n    background: #eee;\n  }\n\n  .tiptap .tiptap-mathematics-render {\n    border-radius: 0.25rem;\n  }\n\n  .tiptap .tiptap-mathematics-render[data-type=\'inline-math\'] {\n    display: inline-block;\n  }\n\n  .tiptap .tiptap-mathematics-render[data-type=\'block-math\'] {\n    display: block;\n    margin: 1rem 0;\n    padding: 1rem;\n    text-align: center;\n  }\n\n  .tiptap .tiptap-mathematics-render.inline-math-error,\n  .tiptap .tiptap-mathematics-render.block-math-error {\n    background: var(--red-light);\n    color: var(--red);\n    border: 1px solid var(--red-dark);\n    padding: 0.5rem;\n    border-radius: 0.25rem;\n  }\n\n  /* Task list specific styles */\n  .tiptap ul[data-type=\'taskList\'] {\n    list-style: none;\n    margin-left: 0;\n    padding: 0.2em;\n  }\n\n  .tiptap ul[data-type=\'taskList\'] li {\n    align-items: flex-start;\n    display: flex;\n    margin: 0 !important;\n    padding: 0.3em !important;\n    gap: 0.5rem;\n  }\n\n  .tiptap ul[data-type=\'taskList\'] li > label {\n    flex: 0 0 auto;\n    user-select: none;\n    margin-top: -0.1em !important;\n  }\n\n  .tiptap ul[data-type=\'taskList\'] li > div {\n    flex: 1 1 auto;\n    margin: 0 !important;\n    padding: 0 !important;\n    /* Prevent content from overflowing */\n    min-width: 0;\n  }\n\n  .tiptap ul[data-type=\'taskList\'] input[type=\'checkbox\'] {\n    cursor: pointer;\n    /* Ensure consistent checkbox sizing */\n    margin: 0;\n    flex-shrink: 0;\n  }\n\n  .tiptap ul[data-type=\'taskList\'] ul[data-type=\'taskList\'] {\n    margin: 0 !important;\n  }\n\n  /* Optional: Handle the span element in your label if it\'s for custom styling */\n  .tiptap ul[data-type=\'taskList\'] li > label span {\n    display: inline-block;\n    /* Add custom checkbox styles here if needed */\n  }\n\n  /* Ensure paragraphs in task list items don\'t add extra spacing */\n  .tiptap ul[data-type=\'taskList\'] li p {\n    margin: 0 !important;\n  }\n\n  /* toc  #toc-ex*/\n  #toc-ex .col-group {\n    display: flex;\n    flex-direction: row;\n  }\n\n  @media (max-width: 540px) {\n    #toc-ex .col-group {\n      flex-direction: column-reverse;\n    }\n  }\n\n  #toc-ex .main {\n    display: flex;\n    flex-direction: column;\n    width: 100%;\n    height: 100%;\n    overflow: auto;\n    /* max-height: 28rem; */\n  }\n\n  #toc-ex .sidebar {\n    border-left: 1px solid var(--gray-3);\n    flex-grow: 0;\n    flex-shrink: 0;\n    padding: 1rem;\n    width: 15rem;\n    position: sticky;\n    height: 100vh;\n    top: 0;\n  }\n\n  @media (min-width: 800px) {\n    #toc-ex .sidebar {\n      width: 20rem;\n    }\n  }\n\n  @media (max-width: 540px) {\n    #toc-ex .sidebar {\n      border-bottom: 1px solid var(--gray-3);\n      border-left: unset;\n      width: 100%;\n      height: auto;\n      position: unset;\n      padding: 1.5rem;\n    }\n  }\n\n  #toc-ex .sidebar-options {\n    align-items: flex-start;\n    display: flex;\n    flex-direction: column;\n    height: 100%;\n    gap: 1rem;\n    position: sticky;\n    top: 1rem;\n  }\n\n  #toc-ex .table-of-contents {\n    display: flex;\n    flex-direction: column;\n    font-size: 0.875rem;\n    gap: 0.25rem;\n    overflow: auto;\n    text-decoration: none;\n  }\n\n  #toc-ex .table-of-contents > div {\n    border-radius: 0.25rem;\n    padding-left: calc(0.875rem * (var(--level) - 1));\n    transition: all 0.2s cubic-bezier(0.65, 0.05, 0.36, 1);\n  }\n\n  #toc-ex .table-of-contents > div:hover {\n    background-color: var(--gray-2);\n  }\n\n  #toc-ex .table-of-contents .empty-state {\n    color: var(--gray-5);\n    user-select: none;\n  }\n\n  #toc-ex .table-of-contents .is-active a {\n    color: var(--purple);\n  }\n\n  #toc-ex .table-of-contents .is-scrolled-over a {\n    color: var(--gray-5);\n  }\n\n  .dark #toc-ex .table-of-contents a,\n  .dark #toc-ex .table-of-contents .is-scrolled-over a {\n    color: #888;\n  }\n\n  #toc-ex .table-of-contents a {\n    color: var(--black);\n    display: flex;\n    gap: 0.25rem;\n    text-decoration: none;\n  }\n\n  #toc-ex .table-of-contents a::before {\n    content: attr(data-item-index) \'.\';\n  }\n\n  /* Youtube embed */\n  .tiptap div[data-youtube-video] {\n    cursor: move;\n    padding-right: 1.5rem;\n  }\n\n  .tiptap div[data-youtube-video] iframe {\n    border: 0.5rem solid var(--black-contrast);\n    display: block;\n    min-height: 200px;\n    min-width: 200px;\n    outline: 0px solid transparent;\n  }\n\n  .tiptap div[data-youtube-video].ProseMirror-selectednode iframe {\n    outline: 3px solid var(--purple);\n    transition: outline 0.15s;\n  }\n\n  /* confit test */\n  .my-custom-class {\n    border: 2px solid rgb(150, 238, 206);\n  }';
	$.reset(pre);

	var node = $.sibling(pre, 2);

	{
		let $0 = $.derived(() => $.get(success) ? "alternative" : "light");

		Clipboard(node, {
			get color() {
				return $.get($0);
			},
			size: 'sm',
			class: 'absolute end-2 top-2 h-8 px-2.5 font-medium focus:ring-0',
			onclick,
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			get success() {
				return $.get(success);
			},

			set success($$value) {
				$.set(success, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				{
					var consequent = ($$anchor) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						CheckOutline(node_2, { class: 'h-3 w-3' });
						$.next();
						$.append($$anchor, fragment_1);
					};

					var alternate = ($$anchor) => {
						var fragment_2 = root_1();
						var node_3 = $.first_child(fragment_2);

						ClipboardCleanSolid(node_3, { class: 'h-3 w-3' });
						$.next();
						$.append($$anchor, fragment_2);
					};

					$.if(node_1, ($$render) => {
						if ($.get(success)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}