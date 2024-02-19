class BlockerSelect extends HTMLElement {
  constructor() {
    super();
    
    const shadow = this.attachShadow({ mode: 'open' });

    const selectContainer = document.createElement('div');

    selectContainer.classList.add('custom-select');

    selectContainer.innerHTML =
      `<style>
      * {
        box-sizing: border-box;
      }

      :host {
        display: inline-block;
        /* TODO: Remove */
        // min-width: 10rem;
        // width: 16rem;
        
      }

      div.custom-select {
        position: relative;
      }

      button {
        height: 2.25rem;
        width: 100%;
        font-size: 14px;
        padding: 0.25rem 0.75rem;
        border: 0.0625rem solid #e3e7f3;
        border-radius: 0.375rem;
        background-color: #fbfcff;
        box-shadow: 0rem 0.0625rem 0.125rem rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: row;
        cursor: pointer;
        user-select: none;
      }

      ::slotted(div.option) {
        align-self: center;
      }

      button > span.title {
        align-self: center;
        pointer-events: none;
      }

      button > i.hola {
        align-self: center;
        margin-left: auto;
        mask-image: url('./icons/expand.svg');
        mask-repeat: no-repeat;
        mask-size: 100%;
        background-color: #9fa3ad;
        display: block;
        width: 1rem;
        height: 1rem;
        pointer-events: none;
      }

      div.option-list {
        width: 100%;
        position: absolute;
        left: 0;
        top: 2.5rem;
        padding: 0.25rem;
        flex-direction: column;
        border-radius: 0.375rem;
        background-color: #fbfcff;
        border: 0.0625rem solid #e3e7f3;
        box-shadow: 0rem 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
        justify-content: start;
        z-index: 1;
        display: flex;
        opacity: 0;
        pointer-events: none;
      }

      div.option-list.active {
        pointer-events: unset;
        transform-origin: top center;
        animation-name: enter;
        animation-duration: 150ms;
        animation-fill-mode: forwards;
        animation-timing-function: ease-out;
      }

      div.option-list > span.list-title {
        font-size: 0.875rem;
        padding: 0.375rem 0.5rem;
        font-weight: 600;
        pointer-events: none;
        user-select: none;
      }

      ::slotted(option) {
        padding: 0.375rem 0.5rem;
        font-size: 0.875rem;
        user-select: none;
        display: flex;
        flex-direction: row;
        align-items: center;
        border-radius: 0.25rem;
        transition: background-color 100ms ease-in-out;
      }

      ::slotted(option:hover) {
        background-color: #e7e9f0;
      }

      @keyframes enter {
        0% {
          transform: translateY(-20px) scaleY(90%);
        }

        25% {
          opacity: 0;
        }

        100% {
          opacity: 1;
          transform: translateY(0px) scaleY(100%);
        }
      }

    </style>
    <button data-role="select-button">
      <span class="title">${this.title}</span>
      <i class="hola"></i>
    </button>
    <div class="option-list">
      <span class="list-title">${this.title}</span>
      <slot></slot>
    </div>`;

    shadow.appendChild(selectContainer);

    this.selectButton = this.shadowRoot.querySelector('button[data-role="select-button"]');
    this.optionList = this.shadowRoot.querySelector('div.option-list');
    this.listenForEventsInDOM = this.listenForEventsInDOM.bind(this);
    this.isOpen = false;

    this.defaultOption = {
      value: undefined,
      text: undefined
    };

    this.selectedOption = {
      value: undefined,
      text: undefined
    };

  }

  connectedCallback() {
    this.options = [...this.obtainOptions()];
    this.initListeners();

    // const a = this.getAttribute('default-value');
    const defaultValue = this.getAttribute('default-value');
    for (let i = 0; i < this.options.length; i++) {
      const option = this.options[i];

      if (option.value === defaultValue) {
        this.selectedOption = {
          value: option.value,
          text: option.text
        };
        this.updateDisplay();
        break;
      }
    }
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.listenForEventsInDOM);
  }

  obtainOptions() {
    const options = [];

    const optionElements = this.shadowRoot.querySelector('slot').assignedElements();

    for (let i = 0; i < optionElements.length; i++) {
      const optionElement = optionElements[i];

      const value = optionElement.getAttribute('data-value');
      const text = optionElement.innerText;

      options.push(
        {
          value,
          text
        }
      );
    }

    return options;
  }

  initListeners() {
    this.shadowRoot.addEventListener('click', (event) => {

      if (event.target.matches('button[data-role="select-button"]')) {
        if (this.isOpen) {
          this.isOpen = false;
          this.optionList.classList.remove('active');
        } else {
          this.isOpen = true;
          this.optionList.classList.add('active');
        }

      } else if (event.target.matches('option')) {


        for (let i = 0; i < this.options.length; i++) {
          const option = this.options[i];

          if (option.value === event.target.getAttribute('data-value')) {
            this.selectedOption = {
              value: option.value,
              text: option.text
            };
            this.updateDisplay();
            if (this.onchange) {
              // const event = new Event('change', { bubbles: true, cancelable: true, composed: true })
              const event = {
                target: this
              }
              this.onchange(event);
            }
            break;
          }
        }

        this.isOpen = false;
        this.optionList.classList.remove('active');
      }
    });

    document.addEventListener('click', this.listenForEventsInDOM);
  }

  listenForEventsInDOM(event) {
    if (event.target !== this && !this.shadowRoot.querySelector('slot').assignedElements().includes(event.target)) {
      this.optionList.classList.remove('active');
      this.isOpen = false;
    }
  }

  updateDisplay() {
    this.selectButton.querySelector('span.title').innerText = this.selectedOption.text;
  }
}

export default BlockerSelect;
