let currentPage = 0;
let isAnimating = false;

const leftPage = document.getElementById("leftPage");
const rightPage = document.getElementById("rightPage");

const prevButton = document.getElementById("prevPage");
const nextButton = document.getElementById("nextPage");

const turnerRight = document.getElementById("pageTurnerRight");
const turnerLeft = document.getElementById("pageTurnerLeft");

const rightFront = document.getElementById("rightFront");
const rightBack = document.getElementById("rightBack");

const leftFront = document.getElementById("leftFront");
const leftBack = document.getElementById("leftBack");

const ribbonLinks = document.querySelectorAll(".ribbon-link");

function applyStyles(element, block, type) {
  const properties = [
    "width",
    "height",
    "minWidth",
    "minHeight",
    "maxWidth",
    "maxHeight",
    "fontSize",
    "fontWeight",
    "fontFamily",
    "fontStyle",
    "lineHeight",
    "letterSpacing",
    "textDecoration",
    "textTransform",
    "color",
    "background",
    "backgroundColor",
    "padding",
    "margin",
    "gap",
    "border",
    "borderWidth",
    "borderColor",
    "borderStyle",
    "borderRadius",
    "opacity",
    "boxShadow",
    "flex",
    "flexDirection",
    "flexWrap",
    "justifyContent",
    "alignItems",
    "gridTemplateColumns",
    "gridTemplateRows",
    "objectFit",
    "objectPosition",
    "overflow",
    "display",
  ];

  const pixelProperties = [
    "width",
    "height",
    "minWidth",
    "minHeight",
    "maxWidth",
    "maxHeight",
    "fontSize",
    "padding",
    "margin",
    "gap",
    "borderWidth",
    "borderRadius",
  ];

  properties.forEach((property) => {
    if (block[property] === undefined) return;

    let value = block[property];

    if (typeof value === "number" && pixelProperties.includes(property)) {
      value = `${value}px`;
    }

    element.style[property] = value;
  });

  if (
    block.align !== undefined &&
    !["image", "gallery", "image-row", "group"].includes(type)
  ) {
    element.style.textAlign = block.align;
  }

  if (type === "image" && block.align) {
    element.style.display = "block";

    if (block.align === "center") {
      element.style.marginLeft = "auto";
      element.style.marginRight = "auto";
    }

    if (block.align === "right") {
      element.style.marginLeft = "auto";
      element.style.marginRight = "0";
    }

    if (block.align === "left") {
      element.style.marginLeft = "0";
      element.style.marginRight = "auto";
    }
  }

  if (["gallery", "image-row", "group"].includes(type)) {
    const alignment = {
      left: "flex-start",
      center: "center",
      right: "flex-end",
      stretch: "stretch",
    };

    if (block.align) {
      element.style.alignItems = alignment[block.align] || block.align;
    }
  }

  if (block.justify !== undefined) {
    element.style.justifyContent = block.justify;
  }

  if (block.columns !== undefined && type === "gallery") {
    element.style.gridTemplateColumns = `repeat(${block.columns}, minmax(0, 1fr))`;
  }

  if (block.style && typeof block.style === "object") {
    Object.entries(block.style).forEach(([property, value]) => {
      if (typeof value === "number" && pixelProperties.includes(property)) {
        value = `${value}px`;
      }

      element.style[property] = value;
    });
  }

  if (block.id) {
    element.id = block.id;
  }

  if (block.className) {
    element.classList.add(...block.className.split(/\s+/));
  }

  if (block.title) {
    element.title = block.title;
  }
}

function createImage(imageData, imageHeight) {
  const data = typeof imageData === "string" ? { src: imageData } : imageData;

  if (!data || !data.src) {
    console.warn("Image sans source :", data);
    return document.createElement("div");
  }

  const figure = document.createElement("figure");
  const image = document.createElement("img");

  image.src = data.src;
  image.alt = data.alt || "";
  image.classList.add("page-image");
  image.loading = "lazy";

  if (imageHeight !== undefined) {
    image.style.height =
      typeof imageHeight === "number" ? `${imageHeight}px` : imageHeight;

    image.style.width = "100%";
  }

  if (data.fit) {
    image.style.objectFit = data.fit;
  }

  if (data.position) {
    image.style.objectPosition = data.position;
  }

  applyStyles(image, data, "image");

  figure.appendChild(image);

  if (data.caption) {
    const caption = document.createElement("figcaption");
    caption.textContent = data.caption;
    figure.appendChild(caption);
  }

  if (data.figureStyle) {
    applyStyles(figure, data.figureStyle, "figure");
  }

  return figure;
}

function renderBlock(block) {
  if (!block || typeof block !== "object") {
    return null;
  }

  let element;

  switch (block.type) {
    case "title":
      element = document.createElement("h2");
      element.innerHTML = block.content || "";
      break;

    case "subtitle":
      element = document.createElement("h3");
      element.innerHTML = block.content || "";
      break;

    case "text":
      element = document.createElement("p");
      element.innerHTML = block.content || "";
      break;

    case "image":
      element = createImage(block);
      break;

    case "caption":
      element = document.createElement("figcaption");
      element.innerHTML = block.content || "";
      break;

    case "divider":
      element = document.createElement("hr");
      element.style.border = "none";
      element.style.borderTop = `1px solid ${block.color || "currentColor"}`;
      break;

    case "spacer":
      element = document.createElement("div");
      element.style.height =
        block.height !== undefined
          ? typeof block.height === "number"
            ? `${block.height}px`
            : block.height
          : "20px";
      break;

    case "link":
      element = document.createElement("a");
      element.innerHTML = block.content || "";
      element.href = block.url || "#";

      if (block.target) {
        element.target = block.target;

        if (block.target === "_blank") {
          element.rel = "noopener noreferrer";
        }
      }
      break;

    case "gallery":
      element = document.createElement("div");
      element.classList.add("page-gallery");
      element.style.display = "grid";
      element.style.gridTemplateColumns = `repeat(${block.columns || 2}, minmax(0, 1fr))`;

      if (Array.isArray(block.images)) {
        block.images.forEach((imageData) => {
          element.appendChild(createImage(imageData, block.imageHeight));
        });
      }
      break;

    case "image-row":
      element = document.createElement("div");
      element.classList.add("page-image-row");
      element.style.display = "flex";
      element.style.flexDirection = "row";
      element.style.flexWrap = "wrap";

      if (Array.isArray(block.images)) {
        block.images.forEach((imageData) => {
          const figure = createImage(imageData, block.imageHeight);

          figure.style.flex = "1 1 0";
          figure.style.minWidth = "0";

          element.appendChild(figure);
        });
      }
      break;

    case "group":
      element = document.createElement("div");
      element.classList.add("page-group");

      const layout = block.layout || "column";

      if (layout === "grid") {
        element.style.display = "grid";
        element.style.gridTemplateColumns = `repeat(${block.columns || 2}, minmax(0, 1fr))`;
      } else {
        element.style.display = "flex";
        element.style.flexDirection = ["row", "horizontal"].includes(layout)
          ? "row"
          : "column";

        if (["row", "horizontal"].includes(layout)) {
          element.style.flexWrap = "wrap";
        }
      }

      if (Array.isArray(block.content)) {
        block.content.forEach((child) => {
          const rendered = renderBlock(child);

          if (rendered) {
            element.appendChild(rendered);
          }
        });
      }
      break;

    default:
      console.warn("Type de bloc inconnu :", block.type);
      return null;
  }

  applyStyles(element, block, block.type);

  return element;
}

function renderPage(element, content = []) {
  element.replaceChildren();

  if (!Array.isArray(content)) {
    console.warn("Contenu de page invalide :", content);
    return;
  }

  content.forEach((block) => {
    const rendered = renderBlock(block);

    if (rendered) {
      element.appendChild(rendered);
    }
  });
}

function goToPage(index) {
  if (isAnimating) return;

  if (!Number.isInteger(index) || index < 0 || index >= pages.length) {
    console.warn("Index de page invalide :", index);
    return;
  }

  if (index === currentPage) return;

  const direction = index > currentPage ? "forward" : "backward";

  if (direction === "forward") {
    renderPage(rightFront, pages[currentPage].right);
    renderPage(rightBack, pages[index].left);
    renderPage(rightPage, pages[index].right);

    animateTurner(turnerRight, direction, () => {
      currentPage = index;
    });
  } else {
    renderPage(leftFront, pages[currentPage].left);
    renderPage(leftBack, pages[index].right);
    renderPage(leftPage, pages[index].left);

    animateTurner(turnerLeft, direction, () => {
      currentPage = index;
    });
  }
}

function updateBook() {
  if (!Array.isArray(pages) || pages.length === 0) {
    console.warn("Aucune double page définie.");
    return;
  }

  const current = pages[currentPage];

  renderPage(leftPage, current.left);
  renderPage(rightPage, current.right);

  prevButton.disabled = currentPage === 0;
  nextButton.disabled = currentPage === pages.length - 1;

  ribbonLinks.forEach((link) => {
    const target = Number(link.dataset.page);
    const isActive = target === currentPage;

    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

ribbonLinks.forEach((link) => {
  link.addEventListener("click", () => {
    goToPage(Number(link.dataset.page));
  });
});

function animateTurner(turner, direction, callback) {
  isAnimating = true;

  turner.style.transition = "none";
  turner.style.visibility = "visible";
  turner.style.transform = "rotateY(0deg)";

  turner.offsetHeight;

  turner.style.transition = "transform 0.8s ease-in-out";

  function handleTransition(event) {
    if (event.target !== turner || event.propertyName !== "transform") {
      return;
    }

    turner.removeEventListener("transitionend", handleTransition);

    callback();

    turner.style.transition = "none";
    turner.style.transform = "rotateY(0deg)";
    turner.style.visibility = "hidden";

    turner.offsetHeight;

    turner.style.removeProperty("transition");
    turner.style.removeProperty("transform");
    turner.style.removeProperty("visibility");

    isAnimating = false;

    updateBook();
  }

  turner.addEventListener("transitionend", handleTransition);

  requestAnimationFrame(() => {
    turner.style.transform =
      direction === "forward" ? "rotateY(-180deg)" : "rotateY(180deg)";
  });
}

function nextPage() {
  if (isAnimating || currentPage >= pages.length - 1) {
    return;
  }

  const next = pages[currentPage + 1];

  renderPage(rightFront, pages[currentPage].right);
  renderPage(rightBack, next.left);
  renderPage(rightPage, next.right);

  animateTurner(turnerRight, "forward", () => {
    currentPage++;
  });
}

function previousPage() {
  if (isAnimating || currentPage <= 0) {
    return;
  }

  const previous = pages[currentPage - 1];

  renderPage(leftFront, pages[currentPage].left);
  renderPage(leftBack, previous.right);
  renderPage(leftPage, previous.left);

  animateTurner(turnerLeft, "backward", () => {
    currentPage--;
  });
}

nextButton.addEventListener("click", nextPage);
prevButton.addEventListener("click", previousPage);

if (pages.length > 0) {
  currentPage = 0;
  updateBook();
}
