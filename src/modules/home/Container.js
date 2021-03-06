import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import FirebaseActions from '../core/FirebaseAction';
import { RecipeRow } from './components';
import { LoadingIndicator } from '../../components';
import './Home.css';
import $ from 'jquery';
import 'datatables.net';
import '../../any-number.js';
import { FaPlus } from 'react-icons/fa';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { fetching: true };
  }

  componentDidMount() {
    let rows = [];
    FirebaseActions.getOnce('', snapshot => {
      this.setState({ fetching: false });
      snapshot.forEach(child => {
        let key = child.key;
        let recipe = child.val();
        // console.log(recipe);
        rows.push(<RecipeRow key={key} data={recipe} linkKey={key} />);
      });

      this.setState({ rows: rows });
      $('#recipeTable').DataTable({
        columnDefs: [
          { width: '10%', targets: 0 },
          { type: 'any-number', targets: 0 }
        ]
      });
    });
  }

  render() {
    const { fetching } = this.state;
    console.log(`fetching: ${fetching}`);
    return fetching ? (
      <LoadingIndicator />
    ) : (
      <div className="container recipeList">
        <div>
          <div className="recipeActions">
            <Link to="/recipe/new">
              <button className="btn">
                <FaPlus /> <span>Recipe</span>
              </button>
            </Link>
          </div>
          <div className="table-responsive">
            <table id="recipeTable" className="table table-striped table-hover">
              <thead>
                <tr>
                  <th scope="col">No</th>
                  <th scope="col">Name</th>
                </tr>
              </thead>
              <tbody>{this.state.rows}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
