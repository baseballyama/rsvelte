import * as $ from 'svelte/internal/server';

import {
	Accordion,
	AccordionItem,
	Alert,
	Badge,
	Breadcrumb,
	BreadcrumbItem,
	Button,
	ButtonDropdown,
	ButtonGroup,
	ButtonToolbar,
	Card,
	CardBody,
	CardColumns,
	CardDeck,
	CardFooter,
	CardGroup,
	CardHeader,
	CardImg,
	CardImgOverlay,
	CardLink,
	CardSubtitle,
	CardText,
	CardTitle,
	Carousel,
	CarouselCaption,
	CarouselControl,
	CarouselIndicators,
	CarouselItem,
	Col,
	Collapse,
	Column,
	Container,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
	Fade,
	Figure,
	Form,
	FormCheck,
	FormFeedback,
	FormGroup,
	FormText,
	Icon,
	Image,
	InlineContainer,
	Input,
	InputGroup,
	InputGroupText,
	Jumbotron,
	Label,
	ListGroup,
	ListGroupItem,
	Modal,
	ModalBackdrop,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Nav,
	Navbar,
	NavItem,
	NavLink,
	NavbarBrand,
	NavbarToggler,
	Offcanvas,
	OffcanvasBackdrop,
	OffcanvasBody,
	OffcanvasHeader,
	Pagination,
	PaginationItem,
	PaginationLink,
	Popover,
	Portal,
	Progress,
	Row,
	Spinner,
	Styles,
	Table,
	TabContent,
	TabPane,
	Toast,
	ToastBody,
	ToastHeader,
	Tooltip
} from '@sveltestrap/sveltestrap';

export default function _page($$renderer) {
	const colors = [
		'primary',
		'secondary',
		'success',
		'danger',
		'warning',
		'info',
		'light',
		'dark'
	];

	const carouselItems = [
		{
			url: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa1d%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa1d%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.921875%22%20y%3D%22218.3%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
			title: 'Slide 1',
			subTitle: 'Slide 1'
		},

		{
			url: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa20%20text%20%7B%20fill%3A%23444%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa20%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23666%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22247.3203125%22%20y%3D%22218.3%22%3ESecond%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
			title: 'Slide 2',
			subTitle: 'Slide 2'
		},

		{
			url: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa21%20text%20%7B%20fill%3A%23333%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa21%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23555%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22277%22%20y%3D%22218.3%22%3EThird%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
			title: 'Slide 3',
			subTitle: 'Slide 3'
		}
	];

	const items = [
		'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa1d%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa1d%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.921875%22%20y%3D%22218.3%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
		'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa20%20text%20%7B%20fill%3A%23444%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa20%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23666%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22247.3203125%22%20y%3D%22218.3%22%3ESecond%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
		'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa21%20text%20%7B%20fill%3A%23333%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa21%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23555%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22277%22%20y%3D%22218.3%22%3EThird%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'
	];

	let activeIndex = 0;
	let isDropdownOpen = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main class="svelte-u8rdjy"><h1 class="svelte-u8rdjy">Sveltestrap</h1> <section data-testid="accordion" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Accordion</h2> `);

		Accordion($$renderer, {
			children: ($$renderer) => {
				AccordionItem($$renderer, {
					active: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Fallbrook`);
					},

					$$slots: {
						default: true,
						header: ($$renderer) => {
							$$renderer.push(`<h4 class="m-0 svelte-u8rdjy" slot="header">Home</h4>`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				AccordionItem($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<a href="#home" class="svelte-u8rdjy">Buena Vista Elementary</a>`);
					},

					$$slots: {
						default: true,
						header: ($$renderer) => {
							$$renderer.push(`<h4 class="m-0 svelte-u8rdjy" slot="header">School</h4>`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				AccordionItem($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->UCSB Library`);
					},

					$$slots: {
						default: true,
						header: ($$renderer) => {
							$$renderer.push(`<h4 class="m-0 svelte-u8rdjy" slot="header">Library</h4>`);
						}
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></section> <section data-testid="alert" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Alerts</h2> <!--[-->`);

		const each_array = $.ensure_array_like(colors);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let color = each_array[$$index];

			Alert($$renderer, {
				color,
				children: ($$renderer) => {
					$$renderer.push(`<h4 class="alert-heading text-capitalize svelte-u8rdjy">${$.escape(color)}</h4> Lorem ipsum dolor sit amet, consectetur adipiscing elit. <a href="#todo" class="alert-link svelte-u8rdjy">Also, alert-links are colored to match</a> .`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></section> <section data-testid="badge" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Badges</h2> <!--[-->`);

		const each_array_1 = $.ensure_array_like(colors);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let color = each_array_1[$$index_1];

			Badge($$renderer, {
				color,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(color)}`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></section> <section data-testid="breadcrumb" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Breadcrumbs</h2> `);

		Breadcrumb($$renderer, {
			children: ($$renderer) => {
				BreadcrumbItem($$renderer, {
					active: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Home`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Breadcrumb($$renderer, {
			children: ($$renderer) => {
				BreadcrumbItem($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<a href="#home" class="svelte-u8rdjy">Home</a>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				BreadcrumbItem($$renderer, {
					active: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Library`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Breadcrumb($$renderer, {
			children: ($$renderer) => {
				BreadcrumbItem($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<a href="#home" class="svelte-u8rdjy">Home</a>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				BreadcrumbItem($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<a href="#library" class="svelte-u8rdjy">Library</a>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				BreadcrumbItem($$renderer, {
					active: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Data`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></section> <section data-testid="button" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Buttons</h2> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Hello World`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			color: 'primary',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Hello World`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			color: 'warning',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Hello World`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			color: 'danger',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Hello World`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Hello World`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></section> <section data-testid="button-group" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Button Group</h2> `);

		ButtonGroup($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					color: 'primary',
					active: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Alpha`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Bravo`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Charlie`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></section> <section data-testid="button-toolbar" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Button Toolbar</h2> `);

		ButtonToolbar($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->File`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Edit`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->View`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></section> <section data-testid="card" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Cards</h2> `);

		Card($$renderer, {
			class: 'mb-3',
			children: ($$renderer) => {
				CardHeader($$renderer, {
					children: ($$renderer) => {
						CardTitle($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Card title`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				CardBody($$renderer, {
					children: ($$renderer) => {
						CardSubtitle($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Card subtitle`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						CardText($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Some quick example text to build on the card title and make up the bulk of the card's content.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Button`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				CardFooter($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Footer`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></section> <section data-testid="carousel" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Carousel</h2> <div class="carousel-example svelte-u8rdjy"><div class="carousel-size svelte-u8rdjy">`);

		Carousel($$renderer, {
			items,
			get activeIndex() {
				return activeIndex;
			},

			set activeIndex($$value) {
				activeIndex = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				CarouselIndicators($$renderer, {
					items,
					get activeIndex() {
						return activeIndex;
					},

					set activeIndex($$value) {
						activeIndex = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <div class="carousel-inner svelte-u8rdjy"><!--[-->`);

				const each_array_2 = $.ensure_array_like(carouselItems);

				for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
					let item = each_array_2[index];

					CarouselItem($$renderer, {
						itemIndex: index,
						get activeIndex() {
							return activeIndex;
						},

						set activeIndex($$value) {
							activeIndex = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<img${$.attr('src', item.url)} class="d-block w-100 svelte-u8rdjy"${$.attr('alt', item.title)}/> `);
							CarouselCaption($$renderer, { captionHeader: item.title, captionText: item.subTitle });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]--></div> `);

				CarouselControl($$renderer, {
					direction: 'prev',
					items,
					get activeIndex() {
						return activeIndex;
					},

					set activeIndex($$value) {
						activeIndex = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				CarouselControl($$renderer, {
					direction: 'next',
					items,
					get activeIndex() {
						return activeIndex;
					},

					set activeIndex($$value) {
						activeIndex = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div></section> <section data-testid="dropdown" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Dropdown</h2> `);

		Dropdown($$renderer, {
			isOpen: isDropdownOpen,
			toggle: () => isDropdownOpen = !isDropdownOpen,
			children: ($$renderer) => {
				DropdownToggle($$renderer, {
					color: 'primary',
					caret: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Dropdown`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				DropdownMenu($$renderer, {
					children: ($$renderer) => {
						DropdownItem($$renderer, {
							header: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Header`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						DropdownItem($$renderer, {
							disabled: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Action`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						DropdownItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Another Action`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);
						DropdownItem($$renderer, { divider: true });
						$$renderer.push(`<!----> `);

						DropdownItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Another Action`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></section></main> `);
		Styles($$renderer, {});
		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}