# undergroundEvents

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.6.

## Angular compatibility

Validated against the stable releases available on 2026-11-09:

- Angular framework and compiler: 22.2.5.
- Angular CLI, build tooling and CDK: 22.2.6.
- TypeScript 6.0.x and Vitest 5.x, compatible with the Angular build tooling.

The app uses standalone components, signal inputs/outputs, built-in control flow,
`inject()` and zoneless change detection. Tests use the Angular CLI Vitest builder,
`TestBed`, `HttpTestingController` and `RouterTestingHarness`.

Use `npm ci` to install the versions recorded in `package-lock.json`, then validate:

```bash
npm test -- --watch=false
npm run build
npm run lint
```

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
