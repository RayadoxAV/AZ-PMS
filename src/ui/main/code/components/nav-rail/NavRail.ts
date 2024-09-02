const template = document.createElement('template');
template.innerHTML = 
`
<div class="az-nav-rail">
  <div class="item" tabindex="0" data-index="0" data-type="link" data-target="home">
    <span class="icon" data-icon="home"></span>
    <span class="text">Home</span>
  </div>
  <div class="item" tabindex="0" data-index="1" data-type="link" data-target="blocker">
    <span class="icon" data-icon="window"></span>
    <span class="text">4Blocker</span>
  </div>
  <div class="item" tabindex="0" data-index="2" data-type="link" data-target="gantt">
    <span class="icon" data-icon="view_timeline"></span>
    <span class="text">Gantt</span>
  </div>
  <div class="item" tabindex="0" data-index="3" data-type="link" data-target="timeline">
    <span class="icon" data-icon="timeline"></span>
    <span class="text">Timeline</span>
  </div>
  <div class="item" tabindex="0" data-index="4" data-type="window" data-target="settings" style="margin-top: auto; margin-bottom: 2rem">
    <span class="icon" data-icon="settings"></span>
    <span class="text">Settings</span>
  </div>
</div>`

class AZNavRail extends HTMLElement {
  public static templateName: string = 'az-nav-rail';

  private activeItemIndex: number = 0;

  constructor() {
    super();

    const shadowDOM = this.attachShadow({ mode: 'open' });

    const linkElement = document.createElement('link');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute('href', 'code/components/nav-rail/nav-rail.css');

    shadowDOM.appendChild(linkElement);
    shadowDOM.append(template.content.cloneNode(true));

  }

  connectedCallback(): void {
    this.init();
  }

  private init(): void {
    this.listenForEvents();
  }

  private listenForEvents(): void {
    if (!this.shadowRoot) {
      return;
    }

    const element = this.shadowRoot.querySelector('div.az-nav-rail');

    if (!element) {
      return;
    }

    element.addEventListener('click', (event: PointerEvent) => {
      if (event.target !== element) {
        const targetElement = event.target as HTMLElement;
        const type: string = targetElement.getAttribute('data-type');
        const target: string = targetElement.getAttribute('data-target');
        const index: number = Number.parseInt(targetElement.getAttribute('data-index'));

        if (type === 'link') {
          this.shadowRoot.querySelectorAll('div.item')[this.activeItemIndex]?.classList.remove('active');
          targetElement.classList.add('active');
          this.activeItemIndex = index;
        } else if (type === 'window') {
          console.log('open settings');
        }
      }
    });
  }
}

export default AZNavRail;
