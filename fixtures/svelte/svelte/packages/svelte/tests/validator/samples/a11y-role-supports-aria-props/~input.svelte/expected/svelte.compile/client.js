import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a aria-setsize="0" href="/">Link</a> <area aria-pressed="true" alt=""/> <article aria-autocomplete="inline"></article> <aside aria-modal="true"></aside> <body aria-invalid="true"></body> <button aria-valuemax="0">click me</button> <datalist aria-valuenow="0"></datalist> <dd aria-rowindex="0"></dd> <dfn aria-colcount="0"></dfn> <dialog aria-posinset="0"></dialog> <details aria-orientation="undefined"></details> <dt aria-valuemin="0"></dt> <fieldset aria-orientation="undefined"></fieldset> <form aria-disabled="true"></form> <h1 aria-selected="true">H1</h1> <h2 aria-selected="true">H2</h2> <h3 aria-expanded="true">H3</h3> <h4 aria-valuemin="0">H4</h4> <h5 aria-readonly="true">H5</h5> <h6 aria-valuemin="0">H6</h6> <hr aria-required="true"/> <img aria-level="0" alt="invalid aria"/> <li aria-required="true"></li> <link aria-rowcount="0"/> <menu aria-valuemin="0"></menu> <meter aria-colspan="0"></meter> <nav aria-valuetext="x"></nav> <ol aria-sort="none"></ol> <option aria-invalid="true"></option> <optgroup aria-sort="none"></optgroup> <output aria-multiline="true"></output> <progress aria-rowcount="0"></progress> <section aria-invalid="true"></section> <summary aria-rowcount="0"></summary> <tbody aria-colspan="0"></tbody> <textarea aria-valuenow="0"></textarea> <tfoot aria-required="true"></tfoot> <thead aria-valuemin="0"></thead> <tr aria-pressed="true"></tr> <ul aria-multiselectable="true"></ul> <div role="alert" aria-colspan="0"></div> <div role="alertdialog" aria-autocomplete="inline"></div> <div role="application" aria-required="true"></div> <div role="article" aria-multiline="true"></div> <div role="banner" aria-autocomplete="inline"></div> <div role="blockquote" aria-valuetext="x"></div> <div role="button" aria-colspan="0"></div> <div role="caption" aria-setsize="0"></div> <div role="cell" aria-multiline="true"></div> <div role="checkbox" aria-multiline="true" aria-checked="true"></div> <div role="code" aria-invalid="true"></div> <div role="columnheader" aria-colcount="0"></div> <div role="combobox" aria-multiselectable="true" aria-expanded="true"></div> <div role="complementary" aria-readonly="true"></div> <div role="contentinfo" aria-valuetext="x"></div> <div role="definition" aria-multiline="true"></div> <div role="deletion" aria-expanded="true"></div> <div role="dialog" aria-multiline="true"></div> <div role="directory" aria-rowcount="0"></div> <div role="document" aria-valuemin="0"></div> <div role="emphasis" aria-rowindex="0"></div> <div role="feed" aria-colindex="0"></div> <div role="figure" aria-valuemax="0"></div> <div role="form" aria-readonly="true"></div> <div role="generic" aria-valuemax="0"></div> <div role="grid" aria-checked="true"></div> <div role="gridcell" aria-level="0"></div> <div role="group" aria-colspan="0"></div> <div role="heading" aria-activedescendant="id" tabindex="-1" aria-level="0"></div> <div role="insertion" aria-errormessage="error"></div> <div role="link" aria-multiline="true"></div> <div role="list" aria-selected="true"></div> <div role="listbox" aria-haspopup="true"></div> <div role="listitem" aria-activedescendant="id" tabindex="-1"></div> <div role="log" aria-required="true"></div> <div role="main" aria-sort="none"></div> <div role="marquee" aria-autocomplete="inline"></div> <div role="math" aria-multiline="true"></div> <div role="menu" aria-checked="true"></div> <div role="menubar" aria-errormessage="error"></div> <div role="menuitem" aria-checked="true"></div> <div role="menuitemcheckbox" aria-pressed="true" aria-checked="false"></div> <div role="menuitemradio" aria-rowspan="0" aria-checked="false"></div> <div role="meter" aria-valuenow="0" aria-haspopup="true"></div> <div role="navigation" aria-expanded="true"></div> <div role="none" aria-placeholder="x"></div> <div role="note" aria-modal="true"></div> <div role="option" aria-selected="true" aria-valuemax="0"></div> <div role="paragraph" aria-level="0"></div> <div role="presentation" aria-disabled="true"></div> <div role="progressbar" aria-expanded="true"></div> <div role="radio" aria-checked="true" aria-rowindex="0"></div> <div role="radiogroup" aria-valuenow="0"></div> <div role="region" aria-rowspan="0"></div> <div role="row" aria-required="true"></div> <div role="rowgroup" aria-expanded="true"></div> <div role="rowheader" aria-activedescendant="id" tabindex="0"></div> <div role="scrollbar" aria-valuenow="0" aria-rowspan="0"></div> <div role="search" aria-autocomplete="inline"></div> <div role="searchbox" aria-colindex="0"></div> <div role="separator" aria-sort="none"></div> <div role="slider" aria-valuenow="0" aria-placeholder="x"></div> <div role="spinbutton" aria-posinset="0"></div> <div role="status" aria-valuemin="0"></div> <div role="strong" aria-valuemin="0"></div> <div role="subscript" aria-colcount="0"></div> <div role="superscript" aria-level="0"></div> <div role="switch" aria-checked="true" aria-valuenow="0"></div> <div role="tab" aria-required="true"></div> <div role="table" aria-modal="true"></div> <div role="tablist" aria-setsize="0"></div> <div role="tabpanel" aria-multiselectable="true"></div> <div role="term" aria-posinset="0"></div> <div role="textbox" aria-colspan="0"></div> <div role="time" aria-selected="true"></div> <div role="timer" aria-sort="none"></div> <div role="toolbar" aria-valuetext="x"></div> <div role="tooltip" aria-multiline="true"></div> <div role="tree" aria-expanded="true"></div> <div role="treegrid" aria-level="0"></div> <div role="treeitem" aria-selected="true" aria-activedescendant="id" tabindex="-1"></div> <div role="doc-abstract" aria-colindex="0"></div> <div role="doc-acknowledgments" aria-setsize="0"></div> <div role="doc-afterword" aria-modal="true"></div> <div role="doc-appendix" aria-activedescendant="id" tabindex="-1"></div> <div role="doc-backlink" aria-colspan="0"></div> <div role="doc-biblioentry" aria-valuemax="0"></div> <div role="doc-bibliography" aria-level="0"></div> <div role="doc-biblioref" aria-checked="true"></div> <div role="doc-chapter" aria-required="true"></div> <div role="doc-colophon" aria-setsize="0"></div> <div role="doc-conclusion" aria-colindex="0"></div> <div role="doc-cover" aria-modal="true"></div> <div role="doc-credit" aria-selected="true"></div> <div role="doc-credits" aria-orientation="undefined"></div> <div role="doc-dedication" aria-level="0"></div> <div role="doc-endnote" aria-checked="true"></div> <div role="doc-endnotes" aria-colcount="0"></div> <div role="doc-epigraph" aria-multiline="true"></div> <div role="doc-epilogue" aria-colcount="0"></div> <div role="doc-errata" aria-sort="none"></div> <div role="doc-example" aria-multiselectable="true"></div> <div role="doc-footnote" aria-rowcount="0"></div> <div role="doc-foreword" aria-valuenow="0"></div> <div role="doc-glossary" aria-valuetext="x"></div> <div role="doc-glossref" aria-placeholder="x"></div> <div role="doc-index" aria-rowcount="0"></div> <div role="doc-introduction" aria-pressed="true"></div> <div role="doc-noteref" aria-valuenow="0"></div> <div role="doc-notice" aria-selected="true"></div> <div role="doc-pagebreak" aria-rowcount="0"></div> <div role="doc-pagelist" aria-modal="true"></div> <div role="doc-part" aria-setsize="0"></div> <div role="doc-preface" aria-orientation="undefined"></div> <div role="doc-prologue" aria-required="true"></div> <div role="doc-pullquote" aria-rowcount="0"></div> <div role="doc-qna" aria-setsize="0"></div> <div role="doc-subtitle" aria-rowindex="0"></div> <div role="doc-tip" aria-valuenow="0"></div> <div role="doc-toc" aria-posinset="0"></div>  <input type="text" aria-rowspan="0"/> <input type="tel" aria-pressed="true"/> <input type="url" aria-level="0"/> <input type="email" aria-pressed="true"/> <input type="search" aria-valuetext="text"/> <input type="text" aria-valuemin="0"/> <input type="tel" aria-colspan="0"/> <input type="url" aria-posinset="0"/> <input type="email" aria-modal="true"/> <input type="search" aria-rowindex="0"/> <input type="image" alt="some text" aria-valuemax="0"/> <input type="reset" aria-modal="true"/> <input type="submit" aria-placeholder="placeholder"/> <input type="checkbox" aria-rowindex="0"/> <input type="radio" aria-valuetext="text"/> <input type="range" aria-checked="true"/> <menuitem type="command" aria-colindex="0"></menuitem> <menuitem type="checkbox" aria-colcount="0"></menuitem> <menuitem type="radio" aria-placeholder="placeholder"></menuitem>  <a aria-keyshortcuts="x" href="/">Link</a> <area aria-expanded="true" alt=""/> <article aria-dropeffect="none"></article> <aside aria-keyshortcuts="x"></aside> <body aria-labelledby="id"></body> <button aria-hidden="true"></button> <datalist aria-activedescendant="id" tabindex="0"></datalist> <dd aria-labelledby="id"></dd> <dfn aria-details="id"></dfn> <dialog aria-keyshortcuts="x"></dialog> <details aria-keyshortcuts="x"></details> <dt aria-hidden="true"></dt> <fieldset aria-owns="id"></fieldset> <form aria-keyshortcuts="x"></form> <h1 aria-keyshortcuts="x">H1</h1> <h2>H2</h2> <h3>H3</h3> <h4 aria-details="id">H4</h4> <h5 aria-grabbed="true">H5</h5> <h6 aria-grabbed="true">H6</h6> <hr aria-relevant="all"/> <img aria-flowto="id" alt="Valid aria role"/> <li aria-label="x"></li> <link aria-hidden="true"/> <menu aria-roledescription="x"></menu> <meter aria-valuemin="0"></meter> <nav aria-labelledby="id"></nav> <ol aria-grabbed="true"></ol> <option aria-selected="true"></option> <optgroup aria-hidden="true"></optgroup> <output aria-dropeffect="none"></output> <progress aria-hidden="true"></progress> <section aria-details="id"></section> <summary></summary> <tbody></tbody> <textarea aria-busy="true"></textarea> <tfoot aria-labelledby="id"></tfoot> <thead aria-flowto="id"></thead> <tr aria-describedby="id"></tr> <ul aria-dropeffect="none"></ul> <div role="alert" aria-owns="id"></div> <div role="alertdialog" aria-busy="true"></div> <div role="application" aria-invalid="true"></div> <div role="article" aria-atomic="true"></div> <div role="banner" aria-grabbed="true"></div> <div role="blockquote" aria-busy="true"></div> <div role="button" aria-busy="true"></div> <div role="caption" aria-grabbed="true"></div> <div role="cell" aria-rowindex="0"></div> <div role="checkbox" aria-checked="true" aria-details="id"></div> <div role="code" aria-keyshortcuts="x"></div> <div role="columnheader" aria-rowspan="0"></div> <div role="combobox" aria-invalid="true" aria-expanded="true"></div> <div role="complementary" aria-label="x"></div> <div role="contentinfo" aria-dropeffect="none"></div> <div role="definition" aria-grabbed="true"></div> <div role="deletion" aria-busy="true"></div> <div role="dialog" aria-flowto="id"></div> <div role="directory"></div> <div role="document" aria-grabbed="true"></div> <div role="emphasis" aria-atomic="true"></div> <div role="feed" aria-atomic="true"></div> <div role="figure" aria-busy="true"></div> <div role="form" aria-roledescription="x"></div> <div role="generic" aria-current="true"></div> <div role="grid" aria-busy="true"></div> <div role="gridcell" aria-relevant="all"></div> <div role="group" aria-busy="true"></div> <div role="heading" aria-level="" aria-flowto="id"></div> <div role="img" aria-grabbed="true"></div> <div role="insertion" aria-roledescription="x"></div> <div role="link" aria-owns="id"></div> <div role="list" aria-labelledby="id"></div> <div role="listbox" aria-current="true"></div> <div role="listitem"></div> <div role="log"></div> <div role="main" aria-keyshortcuts="x"></div> <div role="marquee" aria-labelledby="id"></div> <div role="math" aria-labelledby="id"></div> <div role="menu" aria-atomic="true"></div> <div role="menubar" aria-grabbed="true"></div> <div role="menuitem" aria-grabbed="true"></div> <div role="menuitemcheckbox" aria-checked="true"></div> <div role="menuitemradio" aria-checked="true" aria-grabbed="true"></div> <div role="meter" aria-valuenow="0" aria-valuetext="x"></div> <div role="navigation"></div> <div role="none" undefined=""></div> <div role="note" aria-hidden="true"></div> <div role="option" aria-selected="true" aria-describedby="id"></div> <div role="paragraph" aria-grabbed="true"></div> <div role="presentation" aria-relevant="all"></div> <div role="progressbar" aria-valuemin="0"></div> <div role="radio" aria-checked="true" aria-roledescription="x"></div> <div role="radiogroup" aria-required="true"></div> <div role="region" aria-roledescription="x"></div> <div role="row" aria-posinset="0"></div> <div role="rowgroup" aria-busy="true"></div> <div role="rowheader" aria-label="x"></div> <div role="scrollbar" aria-valuenow="0" aria-relevant="all"></div> <div role="search" aria-grabbed="true"></div> <div role="searchbox" aria-dropeffect="none"></div> <div role="separator" aria-roledescription="x"></div> <div role="slider" aria-valuenow="0" aria-relevant="all"></div> <div role="spinbutton" aria-required="true"></div> <div role="status" aria-label="x"></div> <div role="strong" aria-keyshortcuts="x"></div> <div role="subscript" aria-keyshortcuts="x"></div> <div role="superscript" aria-live="off"></div> <div role="switch" aria-checked="true" aria-roledescription="x"></div> <div role="tab" aria-flowto="id"></div> <div role="table" aria-rowcount="0"></div> <div role="tablist" aria-atomic="true"></div> <div role="tabpanel" aria-labelledby="id"></div> <div role="term" aria-details="id"></div> <div role="textbox" aria-hidden="true"></div> <div role="time" aria-label="x"></div> <div role="timer" aria-hidden="true"></div> <div role="toolbar" aria-roledescription="x"></div> <div role="tooltip" aria-owns="id"></div> <div role="tree" aria-errormessage="error"></div> <div role="treegrid" aria-details="id"></div> <div role="treeitem" aria-selected="true" aria-dropeffect="none"></div> <div role="doc-abstract" aria-label="x"></div> <div role="doc-acknowledgments"></div> <div role="doc-afterword" aria-flowto="id"></div> <div role="doc-appendix" aria-describedby="id"></div> <div role="doc-backlink" aria-dropeffect="none"></div> <div role="doc-biblioentry" aria-roledescription="x"></div> <div role="doc-bibliography" aria-labelledby="id"></div> <div role="doc-biblioref" aria-haspopup="true"></div> <div role="doc-chapter"></div> <div role="doc-colophon" aria-expanded="true"></div> <div role="doc-conclusion" aria-dropeffect="none"></div> <div role="doc-cover"></div> <div role="doc-credit" aria-haspopup="true"></div> <div role="doc-credits" aria-describedby="id"></div> <div role="doc-dedication" aria-roledescription="x"></div> <div role="doc-endnote" aria-errormessage="error"></div> <div role="doc-endnotes" aria-owns="id"></div> <div role="doc-epigraph"></div> <div role="doc-epilogue" aria-relevant="all"></div> <div role="doc-errata" aria-keyshortcuts="x"></div> <div role="doc-example" aria-invalid="true"></div> <div role="doc-footnote" aria-labelledby="id"></div> <div role="doc-foreword" aria-expanded="true"></div> <div role="doc-glossary" aria-grabbed="true"></div> <div role="doc-glossref" aria-haspopup="true"></div> <div role="doc-index"></div> <div role="doc-introduction" aria-labelledby="id"></div> <div role="doc-noteref" aria-details="id"></div> <div role="doc-notice" aria-owns="id"></div> <div role="doc-pagebreak" aria-owns="id"></div> <div role="doc-pagelist" aria-disabled="true"></div> <div role="doc-part" aria-relevant="all"></div> <div role="doc-preface" aria-label="x"></div> <div role="doc-prologue" aria-invalid="true"></div> <div role="doc-pullquote" undefined=""></div> <div role="doc-qna" aria-errormessage="error"></div> <div role="doc-subtitle" aria-errormessage="error"></div> <div role="doc-tip" aria-owns="id"></div> <div role="doc-toc" aria-expanded="true"></div>  <input type="text" aria-labelledby="id"/> <input type="tel" aria-readonly="true"/> <input type="url" aria-errormessage="id"/> <input type="email" aria-details="id"/> <input type="searchbox" aria-owns="id"/> <input type="text" aria-keyshortcuts="key"/> <input type="tel" aria-readonly="true"/> <input type="url" aria-label="label"/> <input type="email" aria-activedescendant="id"/> <input type="search" aria-dropeffect="none"/> <input type="image" alt="some text" aria-pressed="true"/> <input type="reset" aria-expanded="true"/> <input type="submit" aria-disabled="true"/> <input type="checkbox" aria-controls="id"/> <input type="radio" aria-atomic="true"/> <input type="range" aria-hidden="true"/> <menuitem type="command" aria-live="off"></menuitem> <menuitem type="checkbox" aria-relevant="all"></menuitem> <menuitem type="radio" aria-required="true"></menuitem>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 104);

	$.set_attribute(div, 'aria-controls', []);

	var div_1 = $.sibling(div, 90);

	$.set_attribute(div_1, 'aria-controls', []);

	var input = $.sibling(div_1, 136);

	$.set_attribute(input, 'list', ['id']);

	var input_1 = $.sibling(input, 2);

	$.set_attribute(input_1, 'list', ['id']);

	var input_2 = $.sibling(input_1, 2);

	$.set_attribute(input_2, 'list', ['id']);

	var input_3 = $.sibling(input_2, 2);

	$.set_attribute(input_3, 'list', ['id']);

	var input_4 = $.sibling(input_3, 2);

	$.set_attribute(input_4, 'list', ['id']);

	var h2 = $.sibling(input_4, 50);

	$.set_attribute(h2, 'aria-controls', []);

	var h3 = $.sibling(h2, 2);

	$.set_attribute(h3, 'aria-controls', []);

	var summary = $.sibling(h3, 34);

	$.set_attribute(summary, 'aria-controls', []);

	var tbody = $.sibling(summary, 2);

	$.set_attribute(tbody, 'aria-controls', []);

	var div_2 = $.sibling(tbody, 36);

	$.set_attribute(div_2, 'aria-controls', []);

	var div_3 = $.sibling(div_2, 12);

	$.set_attribute(div_3, 'aria-controls', []);

	var div_4 = $.sibling(div_3, 32);

	$.set_attribute(div_4, 'aria-controls', []);

	var div_5 = $.sibling(div_4, 2);

	$.set_attribute(div_5, 'aria-controls', []);

	var div_6 = $.sibling(div_5, 14);

	$.set_attribute(div_6, 'aria-controls', []);

	var div_7 = $.sibling(div_6, 6);

	$.set_attribute(div_7, 'aria-controls', []);

	var div_8 = $.sibling(div_7, 26);

	$.set_attribute(div_8, 'aria-controls', []);

	var div_9 = $.sibling(div_8, 50);

	$.set_attribute(div_9, 'aria-controls', []);

	var div_10 = $.sibling(div_9, 14);

	$.set_attribute(div_10, 'aria-controls', []);

	var div_11 = $.sibling(div_10, 6);

	$.set_attribute(div_11, 'aria-controls', []);

	var div_12 = $.sibling(div_11, 12);

	$.set_attribute(div_12, 'aria-controls', []);

	var div_13 = $.sibling(div_12, 16);

	$.set_attribute(div_13, 'aria-controls', []);

	var input_5 = $.sibling(div_13, 38);

	$.set_attribute(input_5, 'list', ['id']);

	var input_6 = $.sibling(input_5, 2);

	$.set_attribute(input_6, 'list', ['id']);

	var input_7 = $.sibling(input_6, 2);

	$.set_attribute(input_7, 'list', ['id']);

	var input_8 = $.sibling(input_7, 2);

	$.set_attribute(input_8, 'list', ['id']);

	var input_9 = $.sibling(input_8, 2);

	$.set_attribute(input_9, 'list', ['id']);
	$.next(18);
	$.append($$anchor, fragment);
}