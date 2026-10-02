import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<article role="button"></article> <aside role="checkbox"></aside> <blockquote role="columnheader"></blockquote> <br role="grid"/> <caption role="gridcell"></caption> <dd role="link"></dd> <details role="listbox"></details> <dir role="menu"></dir> <dl role="menubar"></dl> <dfn role="menuitem"></dfn> <dt role="menuitemcheckbox" aria-checked="true"></dt> <fieldset role="menuitemradio" aria-checked="true"></fieldset> <figure><figcaption role="menuitemradio" aria-checked="true"></figcaption></figure> <figure role="option" aria-selected="true"></figure> <footer role="radio" aria-checked="true"></footer> <form role="radiogroup"></form> <h1 role="rowheader">Button</h1> <h2 role="scrollbar">Button</h2> <h3 role="searchbox">Button</h3> <h4 role="slider">Button</h4> <h5 role="spinbutton">Button</h5> <h6 role="switch" aria-checked="true">Button</h6> <hr role="tab"/> <img role="tabpanel" alt="tabpanel"/> <label role="textbox"></label> <legend role="toolbar"></legend> <li role="tree"></li> <main role="treegrid"></main> <mark role="treeitem" aria-selected="true"></mark> <marquee role="doc-backlink"></marquee> <menu role="doc-biblioref"></menu> <meter role="doc-glossref"></meter> <nav role="doc-noteref"></nav> <ol role="button"></ol> <optgroup role="treeitem" aria-selected="true"></optgroup> <output role="treegrid"></output> <p role="columnheader"></p> <pre role="tree"></pre> <progress role="combobox" aria-expanded="true"></progress> <ruby role="toolbar"></ruby> <section role="radio" aria-label="radio" aria-checked="true"></section> <table role="menu"></table> <tbody role="searchbox"></tbody> <tfoot role="listbox"></tfoot> <thead role="slider"></thead> <time role="doc-backlink"></time> <ul role="spinbutton"></ul>  <ul role="menu"></ul> <ul role="menubar"></ul> <ul role="radiogroup"></ul> <ul role="tablist"></ul> <ul role="tree"></ul> <ul role="treegrid"></ul> <ol role="menu"></ol> <ol role="menubar"></ol> <ol role="radiogroup"></ol> <ol role="tablist"></ol> <ol role="tree"></ol> <ol role="treegrid"></ol> <li role="tab"></li> <li role="menuitem"></li> <li role="row"></li> <li role="treeitem"></li> <menu role="menu"></menu> <menu role="menubar"></menu> <menu role="radiogroup"></menu> <menu role="tablist"></menu> <menu role="tree"></menu> <menu role="treegrid"></menu> <div role="button"></div> <div role="checkbox"></div> <div role="columnheader"></div> <div role="combobox"></div> <div role="grid"></div> <div role="gridcell"></div> <div role="link"></div> <div role="listbox"></div> <div role="menu"></div> <div role="menubar"></div> <div role="menuitem"></div> <div role="menuitemcheckbox" aria-checked="true"></div> <div role="menuitemradio" aria-checked="true"></div> <div role="option" aria-selected="true"></div> <div role="progressbar"></div> <div role="radio" aria-checked="true"></div> <div role="radiogroup"></div> <div role="row"></div> <div role="rowheader"></div> <div role="scrollbar"></div> <div role="searchbox"></div> <div role="slider"></div> <div role="spinbutton"></div> <div role="switch" aria-checked="true"></div> <div role="tab"></div> <div role="textbox"></div> <div role="treeitem"></div> <body role="combobox" aria-expanded="true"></body> <td role="button"></td> <div role="alert"></div> <div role="document"></div> <div role="separator"></div> <div role="timer"></div> <frame role="row"></frame>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var aside = $.sibling($.first_child(fragment), 2);

	$.set_attribute(aside, 'aria-checked', false);

	var h2 = $.sibling(aside, 32);

	$.set_attribute(h2, 'aria-controls', []);
	$.set_attribute(h2, 'aria-valuenow', 0);

	var h4 = $.sibling(h2, 4);

	$.set_attribute(h4, 'aria-valuenow', 0);

	var progress = $.sibling(h4, 38);

	$.set_attribute(progress, 'aria-controls', []);

	var thead = $.sibling(progress, 12);

	$.set_attribute(thead, 'aria-valuenow', 0);

	var li = $.sibling(thead, 36);

	$.set_attribute(li, 'aria-selected', false);

	var div = $.sibling(li, 16);

	$.set_attribute(div, 'aria-checked', true);

	var div_1 = $.sibling(div, 4);

	$.set_attribute(div_1, 'aria-controls', []);
	$.set_attribute(div_1, 'aria-expanded', true);

	var div_2 = $.sibling(div_1, 32);

	$.set_attribute(div_2, 'aria-controls', []);
	$.set_attribute(div_2, 'aria-valuenow', 0);

	var div_3 = $.sibling(div_2, 4);

	$.set_attribute(div_3, 'aria-valuenow', 0);

	var div_4 = $.sibling(div_3, 10);

	$.set_attribute(div_4, 'aria-selected', true);

	var body = $.sibling(div_4, 2);

	$.set_attribute(body, 'aria-controls', []);
	$.next(12);
	$.append($$anchor, fragment);
}