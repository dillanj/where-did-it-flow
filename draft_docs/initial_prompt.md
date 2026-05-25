## Task

help me come up with a plan for a project. ask any questions necessary to understand what we are wanting to accomplish. at the end, i need to have a folder of markdown files that you generate. those files should contain at min:

- a file for overall app plan. this one is more concise and an general summary. include other headers besides the ones below.
- a file for each header below (if necessary), where we go into more detail.
  i should be able to hand this off to codex and let it start building the project essentially. use the architectural principles that i use at work (hex - domains, ports, adapters type style we use at work).

## description:

an application that allows users to easily view their money flow in a easy to understand way with visualizations, graphs, & charts.
a user can upload a csv file from their bank and get a summary of their money flow. the user should be able to upload csv files that will 'add' to the existing data in the db. for that specific time period. ie: i may upload one file per month as i get my bank statements, and it needs to go towards the correct year and be able to aggregate by year.
after uplaoding the csv file, we will show inflow vs outflow total amounts. from this screen the user first will be able to map column values that contain a user entered value to a user created category. ie: all cells in the description column with values containing "zelle transaction" maps to "rent".  
 when a user is mapping their data, we have to let them determine if it's a 'positive' outflow or 'negative' outflow. ie: i upload statemetns from my chekcing account which i get my paycheck deposited into. i transfer some of that to savings. that will show up as outflow (negative on the statement), but that's technically a '+' outflow.
user should be able to select graphs to view in a dashboard and customize the dashboard. it should be savable.
once the app is complete, i'm going to either decide to deploy it as a service or open source it via github. so we will wait until the end to setup auth. because of this, we should probably use a local db while developing, and use hexagnoal architecture so that we can easily swap out our api adapters on the BE.

## Must haves:

light and dark theme are a must.
efficiency and speed are a must.
clean code is a must. code as if you are robert c martin.
one git repo for the whole project. then split into BE/FE directories.

## feature/specification:

- a FE react app with typescript for the UI.
- a BE api with typescript for the backend business logic
- db that makes it easy to query data from uploaded csv files
- use of design patterns is encouraged where useful and not overengineering
- code should reflect the style of robert c martin, and be clean and readable
- directory structure should be something like:

```txt
- FE/src/app/
  - feature
    - domain
      - tests/ <--- vitest unit tests here
      - feature-domain.ts
      - domain-model.ts
    - adapter
      - feature-api-adapter.ts
      - packers.ts
      - unpackers.ts
    - presenter
      - feature-presenter.ts
    - view
      - component1.tsx
      ...
      - wrapper.tsx // <--- entry point
    - utils // <---- if needed
  - feature
- BE/src/app
```

## tech stack:

FE:

- typescript react
- vitest
- vite
- tailwind

BE:

- typescript
- node? express? tbd

DB:

- sql lite? tbd

planning:

implementation:

testing:

deployment:

---

LATER AFTER INITIAL PART THAT I JUST WANT FOR MY FUCKING SELF.

feature/specification:

- a FE react app with typescript for the UI
- a BE api with typescript for the backend business logic
- user can build a financial portfolio (really just a representation). they can add accounts to the portfolio.
  - portfolio can be a single account or a multi-account portfolio.
  - portfolio can be created, edited, and deleted.
- for each account:
  - user can create, edit, and delete the account.
  - user can add transactions to the account
  - user can upload a csv file of transactions
