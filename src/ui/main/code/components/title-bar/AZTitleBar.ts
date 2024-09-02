import CustomComponent from '../CustomComponents';

class AZTitleBar extends CustomComponent {
  public id: string = 'az-title-bar';

  public init(): void {
    super.init();

    this.loadStyles();

  }

  private loadStyles(): void {
    if (!this.element) {
      return;
    }

    const linkElement = document.createElement('link');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute('href', 'code/components/title-bar/title-bar.css');

    document.querySelector('head')?.appendChild(linkElement);
  }
}

export default AZTitleBar;
