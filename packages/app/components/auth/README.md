# How to add new auth panel

To add new panel you need to:

-   create panel component at `components/auth/[panelId]`
-   add new context in `components/auth/PanelTransition`
-   connect component to router in `pages/auth/AuthPage`
-   add new state to `services/authFlow` and coresponding test to `tests/services/authFlow`
-   connect state to `authFlow`. Update `services/authFlow/AuthFlow.test` and
    `services/authFlow/AuthFlow.functional.test` (the last one for some complex flow)
-   add new actions to `components/auth/actions` and api endpoints to `services/api`
-   whatever else you need

Commit id with example implementation: f4d315c
