import * as React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

/** Container components */
import DashBoardContainer from "../containers/DashboardContainer";
import DetailsContainer from "../containers/DetailsContainer";

class AppRouter extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact={true} path="/:id/details" component={DetailsContainer} />
          <Route exact={true} path="/*" component={DashBoardContainer} />
        </Switch>
      </Router>
    );
  }
}

export default AppRouter;
