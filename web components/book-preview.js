class BookPreview extends HTMLElement {
  constructor() {
      super();
      this.attachShadow({ mode: "open" }); 
  }

  connectedCallback(){
      const image = this.getAttribute("image");
      const title = this.getAttribute("title");
      const author = this.getAttribute("author");
      const id = this.getAttribute("id");
  }
}
