import React, { Component } from "react";
import { Link } from "react-router-dom";

class Home extends Component {
  render() {
    return <div>
        <h1>Home</h1>
        <Link to="/recipe/2">
          <button>Show the Recipe</button>
        </Link>
        <Link to="/recipe/new">
          <button>Create Recipe</button>
        </Link>
      </div>;
  }
}

export default Home;
