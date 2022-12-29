/// <reference path="component-kit.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../util/validation.ts" />
/// <reference path="../state/project-state.ts" />

namespace App {

    export class ProjectInput extends ComponentKit<HTMLDivElement, HTMLFormElement>{
      titleInputElement: HTMLInputElement;
      descriptionInputElement: HTMLInputElement;
      peopleInputElement: HTMLInputElement;
    
      constructor() {
        super("project-input", "app", true, "user-input");
        this.titleInputElement = <HTMLInputElement>(
          this.element.querySelector("#title")
        );
        this.descriptionInputElement = <HTMLInputElement>(
          this.element.querySelector("#description")
        );
        this.peopleInputElement = <HTMLInputElement>(
          this.element.querySelector("#people")
        );
    
        this.configure();
      }
      configure() {
        this.element.addEventListener("submit", this.submitHandler);
      }
      
      renderContent(): void {}
    
      private collectUserInput(): [string, string, number] | void {
        const entryTitle = this.titleInputElement.value;
        const entryDescription = this.descriptionInputElement.value;
        const entryPeople = this.peopleInputElement.value;
    
        const titleValidatable: Validatable = {
          value: entryTitle,
          required: true,
        };
        const descriptionValidatable: Validatable = {
          value: entryDescription,
          required: true,
          minLength: 5,
        };
        const peopleValidatable: Validatable = {
          value: +entryPeople,
          required: true,
          min: 1,
          max: 100,
        };
    
        if (
          validate(titleValidatable) &&
          validate(descriptionValidatable) &&
          validate(peopleValidatable)
        ) {
          return [entryTitle, entryDescription, +entryPeople];
        } else {
          alert("Please try again!");
          return;
        }
      }
    
      private clearInputs() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
      }
    
      @autobind
      private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.collectUserInput();
        if (Array.isArray(userInput)) {
          const [title, desc, people] = userInput;
          projectState.addProject(title, desc, people);
          this.clearInputs();
        }
      }
    }
}    