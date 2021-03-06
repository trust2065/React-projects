import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './modules/home';
import Recipe from './modules/recipe';
import History from './modules/history';
import HistoryCreate from './modules/historyDetail';
import registerServiceWorker from './registerServiceWorker';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import './modules/core/general.css';
import { Header } from './modules/core';

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <div>
        <Route path="/" render={() => <Header title="Recipes & Records" />} />
        <div className="mt-4">
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/recipe/:id" component={Recipe} />
            <Route
              exact
              path="/recipe/:id/history/:historyId"
              component={HistoryCreate}
            />
            <Route exact path="/recipe/:id/history" component={History} />
            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
