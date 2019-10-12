# NgLaunchdarkly

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.1.1.

Import the module into your AppModule definition:

```ts
{
    ...

    imports: [
        LaunchDarkly.forRoot({
            clientId: 'your client ID', // consider using environment.ts
            options: { streaming: true }, // required for live updates
        }),
    ]
}
```

Then hook up a feature with:

```ts

interface MyFeatures {
    myBoolFlag: boolean;
    myStringFlag: 'onstate' | 'offstate';
    homePageEnabled: string;
}

class MyComponent {

    showHomePage$ = this.launchDarklyService.variationStream('homePageEnabled');

    constructor(
        private launchDarklyService: LaunchDarklyService<MyFeatures>
    )
}
```

Then use it in your template with:

```html
<div *ngIf="showHomePage$ | async">
    Only visible when homepage is enabled! Isn't this cool?!
</div>
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
