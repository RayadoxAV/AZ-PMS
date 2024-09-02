const template = document.createElement('template');
template.innerHTML = 
`
<style>
  div.az-nav-rail-item {
    display: flex;
    flex-direction: column;
    border: 1px solid red;
  }
</style>
<div class="az-nav-rail-item">
  <span class="icon">
    <slot name="icon"></slot>
  </span>
  <span class="text">
    <slot name="text"></slot>
  </span>
</div>`;

class AZNavRailItem extends HTMLElement {
  public static templateName: string = 'az-nav-rail-item';

  constructor() {
    super();

    const shadowDOM = this.attachShadow({ mode: 'open' });
    
    shadowDOM.append(template.content.cloneNode(true));
  }
}

export default AZNavRailItem;
