/// <reference path="component-kit.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../models/project.ts" />
/// <reference path="../models/drag-drop.ts" />


namespace App {
    export class ProjectItem extends ComponentKit<HTMLUListElement, HTMLLIElement> implements Draggable{
        private project: Project;
      
        get persons() {
            return this.project.people === 1 ? '1 person' : `${this.project.people} persons`;
        }
      
        constructor(hostId: string, project: Project) {
          super('single-project', hostId, false, project.id);
          this.project = project;
      
          this.configure();
          this.renderContent();
        }
        @autobind
        dragStartHandler(event: DragEvent) {
          event.dataTransfer!.setData("text/plain", this.project.id);
          event.dataTransfer!.effectAllowed = 'move';
        }
      
        dragEndHandler(_: DragEvent) {
          console.log('DragEnd');
        }
      
        configure() {
          this.element.addEventListener('dragstart', this.dragStartHandler);
          this.element.addEventListener('dragend', this.dragEndHandler);
        }
      
        renderContent(): void {
            this.element.querySelector('h2')!.textContent = this.project.title;
            this.element.querySelector('h3')!.textContent = this.persons + ' assigned.';
            this.element.querySelector('p')!.textContent = this.project.title;
        }
      }
}